import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/mobile/v1/version
 * 
 * Returns current app version info.
 * iOS app checks this on launch and warns if outdated.
 */
export async function GET(request: NextRequest) {
  // Hardcoded for now — should come from environment or database
  const LATEST_VERSION = '3.0.1'
  const MINIMUM_VERSION = '2.5.0'
  const UPDATE_URL = 'https://apps.apple.com/app/id123456789'

  return NextResponse.json({
    latest_version: LATEST_VERSION,
    latest_build: '3.0.0.1',
    minimum_supported_version: MINIMUM_VERSION,
    release_notes: 'Bug fixes and performance improvements',
    update_url: UPDATE_URL,
    force_update: false,
  })
}
