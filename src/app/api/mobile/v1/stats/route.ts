import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/mobile-auth'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * GET /api/mobile/v1/stats
 * 
 * Returns scanning statistics for employee dashboard.
 * Today/week/month summaries with match rates.
 */
async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operatorId = searchParams.get('operator_id')

    if (!operatorId) {
      return NextResponse.json(
        { error: 'missing_operator', message: 'operator_id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Get today's stats from staging
    const today = new Date().toISOString().split('T')[0]
    const { count: todayScanned } = await supabase
      .from('mail_item_staging')
      .select('*', { count: 'exact', head: true })
      .eq('operator_id', operatorId)
      .gte('created_at', today)

    // Simplified response (full aggregation can be added later)
    return NextResponse.json({
      summary: {
        today: {
          total_scanned: todayScanned || 0,
          matched: 0, // TODO: Calculate from validated items
          unmatched: 0,
          match_rate_percent: 0,
        },
        this_week: {
          total_scanned: 0,
          matched: 0,
          unmatched: 0,
          match_rate_percent: 0,
        },
        this_month: {
          total_scanned: 0,
          matched: 0,
          unmatched: 0,
          match_rate_percent: 0,
        },
      },
      details: {
        average_ocr_confidence: 0,
        top_locations: [],
        top_matched_companies: [],
        hourly_distribution: [],
      },
      streaks: {
        current_day_streak: 0,
        longest_day_streak: 0,
        personal_best_daily: 0,
      },
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
