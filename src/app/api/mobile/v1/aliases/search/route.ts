import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/mobile-auth'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * GET /api/mobile/v1/aliases/search?q={query}&operator_id={uuid}
 * 
 * Real-time API search when local SQLite returns 0 results.
 * Wildcard search on alias_name_normalized (case-insensitive).
 */
async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const operatorId = searchParams.get('operator_id')
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'invalid_query', message: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (!operatorId) {
      return NextResponse.json(
        { error: 'missing_operator', message: 'operator_id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Wildcard search on alias_name_normalized
    // Using ilike for case-insensitive matching
    const searchPattern = `%${query.toLowerCase()}%`

    const { data: results, error } = await supabase
      .from('company_alias')
      .select(`
        alias_name,
        alias_name_normalized,
        company:company_id (
          company_name
        ),
        mailbox:company_id (
          mailbox_id,
          pmb,
          mailbox_name
        )
      `)
      .ilike('alias_name_normalized', searchPattern)
      .eq('is_active', true)
      .limit(Math.min(limit, 50))

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'database_error', message: 'Search failed' },
        { status: 500 }
      )
    }

    const transformedResults = results?.map((row: {
      mailbox?: { mailbox_id?: string; pmb?: string };
      alias_name?: string;
      company?: { company_name?: string };
    }) => ({
      mailbox_id: row.mailbox?.mailbox_id,
      mailbox_pmb: row.mailbox?.pmb,
      alias_name: row.alias_name,
      company_name: row.company?.company_name,
    })) || []

    return NextResponse.json({
      results: transformedResults,
      count: transformedResults.length,
      source: 'api',
      prompt_refresh: transformedResults.length === 0,
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
