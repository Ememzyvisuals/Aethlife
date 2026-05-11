import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeString, normalizeCurrency } from '@/lib/utils/sanitize';

const VALID_TIMEZONES = [
  'Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo', 'Africa/Accra',
  'Africa/Johannesburg', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney', 'UTC',
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: profile });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    if (typeof body.full_name === 'string') {
      const name = sanitizeString(body.full_name, 80).trim();
      if (name.length >= 2) updates.full_name = name;
    }

    if (typeof body.timezone === 'string') {
      if (VALID_TIMEZONES.includes(body.timezone)) {
        updates.timezone = body.timezone;
      }
    }

    if (body.currency) {
      updates.currency = normalizeCurrency(body.currency);
    }

    if (typeof body.fcm_token === 'string' && body.fcm_token.length > 0) {
      updates.fcm_token = body.fcm_token.slice(0, 500);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
