import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/mobile-auth'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * GET /api/mobile/v1/aliases/sync
 * 
 * Returns ALL company aliases for the operator's locations.
 * iOS app stores these in local SQLite for offline fuzzy matching.
 * Protected: Requires valid JWT from /auth/google
 */
async function handler(request: NextRequest, auth: AuthContext) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedOperatorId = searchParams.get('operator_id')

    // Validate operator_id matches authenticated user
    if (requestedOperatorId !== auth.operatorId) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Cannot access other operator data' },
        { status: 403 }
      )
    }

    const supabase = getSupabase()

    // Fetch all company aliases with mailbox info for this operator
    // Join: company_alias → company → mailbox → location
    const { data: aliases, error } = await supabase
      .from('company_alias')
      .select(`
        company_id,
        alias_name,
        alias_name_normalized,
        alias_type,
        company:company_id (
          company_id,
          company_name
        ),
        mailbox:company_id (
          mailbox_id,
          pmb,
          mailbox_name,
          location:location_id (
            location_id,
            location_name
          )
        )
      `)
      .eq('is_active', true)
      .order('alias_name_normalized', { ascending: true })

    if (error) {
      console.error('Failed to fetch aliases:', error)
      return NextResponse.json(
        { error: 'database_error', message: 'Failed to fetch company aliases' },
        { status: 500 }
      )
    }

    // Transform to flat structure for mobile consumption
    const transformedAliases = aliases?.map((row: {
      company_id?: string;
      alias_name?: string;
      alias_name_normalized?: string;
      alias_type?: string;
      mailbox?: {
        mailbox_id?: string;
        pmb?: string;
        mailbox_name?: string;
        location?: {
          location_id?: string;
          location_name?: string;
        };
      };
    }) => ({
      company_id: row.company_id,
      alias_name: row.alias_name,
      alias_name_normalized: row.alias_name_normalized,
      alias_type: row.alias_type,
      mailbox_id: row.mailbox?.mailbox_id,
      mailbox_pmb: row.mailbox?.pmb,
      mailbox_name: row.mailbox?.mailbox_name,
      location_id: row.mailbox?.location?.location_id,
      location_name: row.mailbox?.location?.location_name,
    })) || []

    return NextResponse.json({
      aliases: transformedAliases,
      total_count: transformedAliases.length,
      fetched_at: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Aliases sync error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
