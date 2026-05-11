import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { groqWithRotation } from '@/lib/groq/client';
import { serverPremiumGuard, rateLimitExceeded } from '@/lib/utils/premium-guard';
import { format, subDays } from 'date-fns';

const FREE_INSIGHTS_PER_WEEK = 3;

const FREE_TYPES = ['spending_pattern', 'workout_consistency', 'habit_performance', 'weekly_summary'];
const PREMIUM_TYPES = ['behavior_correlation', 'energy_spending', 'streak_prediction', 'overspending_risk', 'cross_system', 'monthly_review'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-side premium check
    const { isPremium } = await serverPremiumGuard(user.id);

    // Rate limit free users
    if (!isPremium) {
      const weekStart = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { count } = await supabase
        .from('ai_insights')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('generated_at', weekStart);

      if ((count ?? 0) >= FREE_INSIGHTS_PER_WEEK) {
        return rateLimitExceeded('AI insights', 168);
      }
    }

    // Gather user data efficiently
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const [
      { data: workouts },
      { data: expenses },
      { data: habitLogs },
      { data: energyLogs },
      { data: stepLogs },
      { data: habits },
    ] = await Promise.all([
      supabase.from('workouts').select('completed_at, duration_minutes').eq('user_id', user.id).gte('completed_at', thirtyDaysAgo),
      supabase.from('expenses').select('date, amount, category_id').eq('user_id', user.id).gte('date', thirtyDaysAgo),
      supabase.from('habit_logs').select('habit_id, date').eq('user_id', user.id).gte('date', thirtyDaysAgo),
      supabase.from('energy_logs').select('date, level, mood').eq('user_id', user.id).gte('date', sevenDaysAgo).order('date'),
      supabase.from('step_logs').select('date, steps').eq('user_id', user.id).gte('date', thirtyDaysAgo),
      supabase.from('habits').select('id, name, streak_count').eq('user_id', user.id).eq('is_active', true),
    ]);

    // Check if user has enough data for meaningful insights
    const totalDataPoints = (workouts?.length ?? 0) + (expenses?.length ?? 0) + (habitLogs?.length ?? 0);
    if (totalDataPoints < 3) {
      return NextResponse.json({
        error: 'Not enough data yet. Log a few workouts, expenses, or habits first.',
        insufficient_data: true,
      }, { status: 422 });
    }

    const summary = {
      workout_count_30d: workouts?.length ?? 0,
      total_expense_30d: Number((expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0).toFixed(2)),
      habit_completion_30d: habitLogs?.length ?? 0,
      active_habits: habits?.length ?? 0,
      avg_energy_7d: energyLogs?.length
        ? Number((energyLogs.reduce((s, e) => s + e.level, 0) / energyLogs.length).toFixed(1))
        : null,
      avg_steps_30d: stepLogs?.length
        ? Math.round(stepLogs.reduce((s, l) => s + l.steps, 0) / stepLogs.length)
        : 0,
      top_habit_streak: habits?.[0]?.streak_count ?? 0,
      recent_energy_trend: energyLogs?.slice(-5).map((e) => ({ date: e.date, level: e.level, mood: e.mood })),
      recent_spending: expenses?.slice(-7).map((e) => ({ date: e.date, amount: Number(e.amount) })),
    };

    const allowedTypes = isPremium ? [...FREE_TYPES, ...PREMIUM_TYPES] : FREE_TYPES;
    const insightType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const isBehavioral = PREMIUM_TYPES.includes(insightType);

    // Generate insight with Groq key rotation
    let aiResult: { title: string; description: string; priority: string; action: string };

    try {
      const groqResponse = await groqWithRotation(async (groq) => {
        return groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: `You are AethLife's behavioral intelligence engine. Analyze this user's 30-day life data and generate ONE specific insight of type: ${insightType}

User data:
${JSON.stringify(summary, null, 2)}

Return ONLY valid JSON (no markdown, no explanation):
{"title":"Max 10 words — be specific","description":"2-3 sentences. Use actual numbers from the data. Be direct and personal.","priority":"low|medium|high|critical","action":"One specific action the user should take this week"}

Rules:
- Use real numbers from the data
- Be specific, not generic  
- Behavioral correlation insights should connect two different life systems
- Priority 'high' only if there is a clear problematic pattern
- 'critical' only if immediate action is genuinely needed`,
          }],
          max_tokens: 400,
          temperature: 0.35,
        });
      });

      const raw = groqResponse.choices[0]?.message?.content ?? '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON in response');

      const p = JSON.parse(match[0]);
      aiResult = {
        title: typeof p.title === 'string' ? p.title.slice(0, 120) : 'New insight',
        description: typeof p.description === 'string' ? p.description.slice(0, 500) : '',
        priority: ['low', 'medium', 'high', 'critical'].includes(p.priority) ? p.priority : 'medium',
        action: typeof p.action === 'string' ? p.action.slice(0, 300) : '',
      };
    } catch (groqError) {
      console.error('[AethLife] Groq insight generation failed:', groqError);

      // Meaningful fallback based on actual data — never generic
      const workoutCount = summary.workout_count_30d;
      const totalSpend = summary.total_expense_30d;

      aiResult = {
        title: workoutCount > 0 ? `${workoutCount} workouts tracked this month` : 'Start logging to unlock insights',
        description: workoutCount > 0
          ? `You've logged ${workoutCount} workouts and ₦${totalSpend.toLocaleString()} in expenses over the past 30 days. With more data, AethLife will surface behavioral patterns connecting your training, spending, and habits.`
          : 'Log your first workout and expense today. AethLife needs 3-7 days of data to generate meaningful behavioral insights.',
        priority: 'low',
        action: workoutCount === 0 ? 'Log a workout today to start building your behavioral profile.' : 'Keep logging daily for deeper cross-system insights.',
      };
    }

    // Save to database
    const { data: insight, error: saveError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        type: insightType,
        title: aiResult.title,
        description: aiResult.description,
        data: { action_suggestion: aiResult.action, data_summary: summary },
        priority: aiResult.priority,
        is_premium: isBehavioral,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('[AethLife] Insight save error:', saveError);
      return NextResponse.json({ error: 'Failed to save insight' }, { status: 500 });
    }

    return NextResponse.json({ data: insight });

  } catch (error) {
    console.error('[AethLife] Insight generation error:', error);
    if (error instanceof Error && error.message.includes('rate limited')) {
      return NextResponse.json(
        { error: 'AI is busy right now. Please try again in a minute.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
}
