import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { groqWithRotation } from '@/lib/groq/client';
import { serverPremiumGuard, rateLimitExceeded } from '@/lib/utils/premium-guard';
import { isAllowedImageType, validateBase64ImageSize } from '@/lib/utils/sanitize';
import { format } from 'date-fns';

const FREE_SCANS_PER_MONTH = 5;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { image?: unknown; mimeType?: unknown };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

    const { image, mimeType } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }
    if (!mimeType || typeof mimeType !== 'string') {
      return NextResponse.json({ error: 'MIME type is required' }, { status: 400 });
    }
    if (!isAllowedImageType(mimeType)) {
      return NextResponse.json({ error: 'Use JPEG, PNG, or WEBP only.' }, { status: 400 });
    }
    if (!validateBase64ImageSize(image, 5)) {
      return NextResponse.json({ error: 'Image too large. Maximum 5MB.' }, { status: 413 });
    }

    // Server-side premium check + free tier rate limit
    const { isPremium } = await serverPremiumGuard(user.id);
    if (!isPremium) {
      const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const { count } = await supabase
        .from('expenses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('ai_scanned', true)
        .gte('created_at', monthStart);

      if ((count ?? 0) >= FREE_SCANS_PER_MONTH) {
        return rateLimitExceeded('receipt scanning', 720);
      }
    }

    // Call Groq Vision with automatic key rotation
    const response = await groqWithRotation(async (groq) => {
      return groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${image}` },
            },
            {
              type: 'text',
              text: `Extract receipt data. Return ONLY valid JSON, no markdown, no explanation:
{"merchant":"string or null","amount":0.00,"date":"YYYY-MM-DD","items":[{"name":"string","amount":0.00}],"category_suggestion":"Food|Transport|Shopping|Entertainment|Health|Utilities|Other","confidence":0.95}
Rules: amount is the total paid (number). date in YYYY-MM-DD. confidence 0.0-1.0.`,
            },
          ],
        }],
        max_tokens: 800,
        temperature: 0.05,
      });
    });

    const raw = response.choices[0]?.message?.content ?? '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not read receipt clearly. Try a clearer photo or enter manually.' },
        { status: 422 }
      );
    }

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(jsonMatch[0]); }
    catch {
      return NextResponse.json(
        { error: 'Receipt format not recognized. Please enter details manually.' },
        { status: 422 }
      );
    }

    // Sanitize AI output — never trust raw values
    const today = format(new Date(), 'yyyy-MM-dd');
    const dateStr = typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
      ? parsed.date : today;
    const rawAmount = typeof parsed.amount === 'number'
      ? parsed.amount
      : parseFloat(String(parsed.amount ?? '0').replace(/[^0-9.]/g, ''));
    const amount = isNaN(rawAmount) || rawAmount < 0 || rawAmount > 50_000_000 ? 0 : Math.round(rawAmount * 100) / 100;
    const merchant = typeof parsed.merchant === 'string'
      ? parsed.merchant.slice(0, 100).replace(/<[^>]*>/g, '').trim()
      : null;
    const validCats = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Other'];
    const category_suggestion = validCats.includes(String(parsed.category_suggestion))
      ? String(parsed.category_suggestion) : 'Other';
    const confidence = Math.min(1, Math.max(0, typeof parsed.confidence === 'number' ? parsed.confidence : 0.7));
    const items = Array.isArray(parsed.items)
      ? parsed.items.slice(0, 30).map((item: unknown) => {
          if (typeof item !== 'object' || item === null) return null;
          const i = item as Record<string, unknown>;
          return {
            name: typeof i.name === 'string' ? i.name.slice(0, 100) : 'Item',
            amount: typeof i.amount === 'number' ? Math.max(0, i.amount) : 0,
          };
        }).filter(Boolean)
      : [];

    return NextResponse.json({ data: { merchant, amount, date: dateStr, items, category_suggestion, confidence } });

  } catch (error) {
    console.error('[AethLife] Receipt scan error:', error);
    // Specific handling for all-keys-exhausted error
    if (error instanceof Error && error.message.includes('rate limited')) {
      return NextResponse.json(
        { error: 'AI service is busy. Please try again in a minute.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Scanning failed. Please try again.' }, { status: 500 });
  }
}
