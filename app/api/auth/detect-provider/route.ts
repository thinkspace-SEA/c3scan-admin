import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Detect authentication provider based on operator domain
 * 
 * This endpoint returns the appropriate Cognito configuration
 * based on the hostname/operator. It supports:
 * - Yardi OIDC (for operators with Yardi integration)
 * - Google OAuth (fallback)
 * - Cognito User Pool (direct fallback)
 */

// Initialize Supabase client for operator lookup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AuthProvider {
  provider_type: string;
  name: string;
  authorization_url: string;
  client_id: string;
  scopes: string[];
  pkce_required: boolean;
  identity_provider?: string; // For Cognito pre-selection
}

interface DetectProviderResponse {
  operator_id: string;
  operator_slug: string;
  operator_name: string;
  branding: {
    name: string;
    logo_url?: string;
    primary_color: string;
  };
  auth_provider: 'cognito';
  cognito_config: {
    user_pool_domain: string;
    client_id: string;
    region: string;
    identity_providers: string[];
    redirect_uri: string;
  };
  suggested_provider?: string; // Which IdP to pre-select
  available_providers: AuthProvider[];
}

/**
 * Extract operator from hostname
 * Examples:
 * - c3scan.thinkspace.com → thinkspace
 * - c3scan.25ncoworking.com → 25ncoworking
 * - localhost → default/dev operator
 */
function getOperatorFromHostname(hostname: string): string {
  // Remove port if present
  const cleanHost = hostname.split(':')[0];
  
  // Local development fallback
  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return process.env.DEFAULT_OPERATOR_SLUG || 'thinkspace';
  }
  
  // Extract subdomain before c3scan
  const match = cleanHost.match(/^c3scan\.(.+)\.com$/);
  if (match) {
    return match[1];
  }
  
  // Direct subdomain: thinkspace.c3scan.io
  const subMatch = cleanHost.match(/^([^.]+)\.c3scan\.io$/);
  if (subMatch) {
    return subMatch[1];
  }
  
  // Fallback: first subdomain
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    return parts[0];
  }
  
  return 'unknown';
}

/**
 * Determine suggested provider based on email domain
 */
function getSuggestedProvider(email: string | null, operatorSlug: string): string {
  if (!email) {
    return 'Google'; // Default fallback
  }
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  
  // Operator-specific mappings
  const domainMappings: Record<string, string> = {
    'thinkspace.com': 'Yardi',
    'thinkspace.io': 'Yardi',
    '25n.co': 'Google', // Update when 25N has their own IdP
    'blankspaces.com': 'Google', // Update when Blankspaces has their own IdP
  };
  
  if (emailDomain && domainMappings[emailDomain]) {
    return domainMappings[emailDomain];
  }
  
  // Default based on operator
  switch (operatorSlug) {
    case 'thinkspace':
      return 'Yardi'; // Thinkspace uses Yardi
    default:
      return 'Google'; // Default to Google for others
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get email from query params (optional, for pre-selecting provider)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    // Get operator from hostname
    const hostname = request.headers.get('host') || 'localhost';
    const operatorSlug = getOperatorFromHostname(hostname);
    
    // Fetch operator details from database
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('operator_id, operator_name, slug, email_domain, branding_config')
      .eq('slug', operatorSlug)
      .single();
    
    if (operatorError || !operator) {
      console.error('Operator lookup failed:', operatorError);
      return NextResponse.json(
        { error: 'Operator not found', code: 'OPERATOR_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // Determine available IdPs for this operator
    const availableProviders: AuthProvider[] = [];
    
    // Yardi (if configured for this operator)
    if (operatorSlug === 'thinkspace') {
      availableProviders.push({
        provider_type: 'oidc',
        name: 'Yardi',
        authorization_url: `https://${process.env.COGNITO_DOMAIN}/oauth2/authorize`,
        client_id: process.env.COGNITO_CLIENT_ID!,
        scopes: ['openid', 'email', 'profile'],
        pkce_required: true,
        identity_provider: 'Yardi'
      });
    }
    
    // Google (always available as fallback)
    availableProviders.push({
      provider_type: 'oauth2',
      name: 'Google',
      authorization_url: `https://${process.env.COGNITO_DOMAIN}/oauth2/authorize`,
      client_id: process.env.COGNITO_CLIENT_ID!,
      scopes: ['openid', 'email', 'profile'],
      pkce_required: true,
      identity_provider: 'Google'
    });
    
    // Cognito User Pool (direct, for staff/admin fallback)
    availableProviders.push({
      provider_type: 'cognito',
      name: 'Email',
      authorization_url: `https://${process.env.COGNITO_DOMAIN}/oauth2/authorize`,
      client_id: process.env.COGNITO_CLIENT_ID!,
      scopes: ['openid', 'email', 'profile'],
      pkce_required: true
    });
    
    // Build redirect URI
    const protocol = hostname === 'localhost' ? 'http' : 'https';
    const redirectUri = `${protocol}://${hostname}/auth/callback`;
    
    // Get branding config (with defaults)
    const branding = operator.branding_config || {};
    
    const response: DetectProviderResponse = {
      operator_id: operator.operator_id,
      operator_slug: operatorSlug,
      operator_name: operator.operator_name,
      branding: {
        name: branding.name || operator.operator_name,
        logo_url: branding.logo_url,
        primary_color: branding.primary_color || '#FFCC00'
      },
      auth_provider: 'cognito',
      cognito_config: {
        user_pool_domain: process.env.COGNITO_DOMAIN!,
        client_id: process.env.COGNITO_CLIENT_ID!,
        region: process.env.AWS_REGION || 'us-west-2',
        identity_providers: availableProviders.map(p => p.name),
        redirect_uri: redirectUri
      },
      suggested_provider: getSuggestedProvider(email, operatorSlug),
      available_providers: availableProviders
    };
    
    // Add cache headers (provider config rarely changes)
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
    
    return NextResponse.json(response, { headers });
    
  } catch (error) {
    console.error('Error in detect-provider:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
