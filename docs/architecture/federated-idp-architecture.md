# Federated Identity Provider Architecture (c3scan)

## Overview

AWS Cognito serves as the centralized identity broker, federating authentication across multiple IdPs while presenting a single, consistent authentication interface to c3scan applications.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Yardi Kube    │     │   Google OAuth   │     │  Other IdPs     │
│   (Thinkspace)  │     │   (Fallback)     │     │  (Microsoft,    │
│                 │     │                  │     │   Okta, etc)    │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         │ OIDC/OAuth 2.0        │ OIDC/OAuth 2.0         │ OIDC/OAuth 2.0
         │                       │                        │
         └───────────────────────┴────────────────────────┘
                                 │
                                 ▼
                  ┌────────────────────────────┐
                  │   AWS Cognito User Pool    │
                  │   (Identity Broker)        │
                  │                            │
                  │  • Federated IdPs          │
                  │  • User Pool (fallback)    │
                  │  • Consistent JWT format   │
                  │  • MFA, password policies  │
                  └─────────────┬──────────────┘
                                │
                                │ Cognito-hosted UI
                                │ or API integration
                                │
                                ▼
                  ┌────────────────────────────┐
                  │      c3scan Apps           │
                  │                            │
                  │  • Customer Portal (/app)  │
                  │  • Admin Portal (/admin)   │
                  │  • Mobile API              │
                  │  • Consistent JWT claims   │
                  └────────────────────────────┘
```

## Authentication Flow

### 1. User Initiates Login
```
User → c3scan Login Page → Detect Provider API
```

### 2. Provider Detection
```
GET /auth/detect-provider?email=user@thinkspace.com

Response:
{
  "operator_id": "thinkspace",
  "operator_slug": "thinkspace",
  "branding": { ... },
  "auth_provider": "cognito",           // Always Cognito
  "cognito_config": {
    "user_pool_domain": "c3scan-prod.auth.us-west-2.amazoncognito.com",
    "client_id": "<cognito_app_client_id>",
    "identity_providers": ["Yardi", "Google"],  // Available IdPs
    "redirect_uri": "https://c3scan.thinkspace.com/auth/callback"
  }
}
```

### 3. Redirect to Cognito Hosted UI
```
c3scan redirects to:
https://c3scan-prod.auth.us-west-2.amazoncognito.com/oauth2/authorize?
  client_id=<client_id>&
  response_type=code&
  scope=openid+email+profile&
  redirect_uri=https://c3scan.thinkspace.com/auth/callback&
  identity_provider=Yardi&          // Pre-select Yardi
  state=<csrf_token>
```

### 4. Cognito → Yardi Federation
```
User → Cognito Hosted UI → Yardi OIDC Login
                              ↓
                    Yardi Authenticates User
                              ↓
                    Yardi returns tokens to Cognito
                              ↓
                    Cognito creates/updates user record
                              ↓
                    Cognito issues Cognito tokens
```

### 5. Callback to c3scan
```
Cognito redirects to:
https://c3scan.thinkspace.com/auth/callback?
  code=<authorization_code>&
  state=<csrf_token>
```

### 6. Token Exchange
```
c3scan backend:
POST https://c3scan-prod.auth.us-west-2.amazoncognito.com/oauth2/token
  grant_type=authorization_code
  client_id=<client_id>
  code=<authorization_code>
  redirect_uri=https://c3scan.thinkspace.com/auth/callback

Response:
{
  "access_token": "<cognito_jwt>",
  "id_token": "<cognito_id_jwt>",
  "refresh_token": "<refresh_token>",
  "expires_in": 3600
}
```

### 7. Session Creation
```
c3scan validates Cognito JWT signature (JWKS)
  ↓
Extract claims: sub, email, name, identities[]
  ↓
Lookup user in c3scan database
  ↓
Create session with operator scoping
  ↓
Redirect to /app or /admin
```

## Cognito User Pool Configuration

### User Pool Settings
- **Name**: c3scan-prod-user-pool
- **Region**: us-west-2 (match your infrastructure)
- **Email**: Required attribute
- **Email verification**: Optional (handled by IdP)
- **MFA**: Optional (can enforce per IdP)
- **Password policy**: Standard (for fallback users)

### Federated Identity Providers

#### Yardi (Primary for Thinkspace)
```
Provider Type: OIDC
Provider Name: Yardi
Client ID: <from_yardi_admin>
Client Secret: <from_yardi_admin>
Authorize Scope: openid email profile
Authorize Endpoint: https://thinkspace.yardikube.com/oauth/authorize
Token Endpoint: https://thinkspace.yardikube.com/oauth/token
User Info Endpoint: https://thinkspace.yardikube.com/oauth/userinfo
JWKS Endpoint: https://thinkspace.yardikube.com/.well-known/jwks.json

Attribute Mapping:
  Yardi claim    → Cognito attribute
  ─────────────────────────────────────
  email          → Email
  email_verified → Email Verified
  name           → Name
  given_name     → Given Name
  family_name    → Family Name
  sub            → Custom: yardi_user_id
```

#### Google (Fallback)
```
Provider Type: Google
Client ID: <google_oauth_client_id>
Client Secret: <google_oauth_secret>
Authorize Scope: openid email profile

Attribute Mapping:
  Google claim   → Cognito attribute
  ─────────────────────────────────────
  email          → Email
  email_verified → Email Verified
  name           → Name
  given_name     → Given Name
  family_name    → Family Name
  sub            → Custom: google_user_id
```

### App Client Configuration
```
App Client Name: c3scan-web-client
Generate Secret: No (for SPA/Next.js)
Authentication Flows:
  ✓ ALLOW_USER_SRP_AUTH
  ✓ ALLOW_REFRESH_TOKEN_AUTH
  ✓ ALLOW_USER_PASSWORD_AUTH (for fallback)

OAuth 2.0 Settings:
  Allowed OAuth Flows:
    ✓ Authorization code grant
    ✓ Implicit grant (optional)
  
  Allowed OAuth Scopes:
    ✓ openid
    ✓ email
    ✓ profile
  
  Callback URLs:
    - https://c3scan.thinkspace.com/auth/callback
    - https://c3scan.25ncoworking.com/auth/callback
    - https://c3scan.blankspaces.com/auth/callback
    - http://localhost:3000/auth/callback (dev)
  
  Sign-out URLs:
    - https://c3scan.thinkspace.com/login
    - https://c3scan.25ncoworking.com/login
    - https://c3scan.blankspaces.com/login
    - http://localhost:3000/login (dev)

Identity Providers:
  ✓ Yardi (for thinkspace.com domain)
  ✓ Google (fallback)
  ✓ Cognito User Pool (fallback)
```

### Domain Configuration
```
Domain prefix: c3scan-prod
Full domain: c3scan-prod.auth.us-west-2.amazoncognito.com
```

## JWT Token Structure

### Cognito ID Token Claims
```json
{
  "sub": "uuid-user-id-in-cognito",
  "aud": "<cognito_app_client_id>",
  "email": "user@thinkspace.com",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "identities": [
    {
      "userId": "user-id-from-yardi",
      "providerName": "Yardi",
      "providerType": "OIDC",
      "issuer": "https://thinkspace.yardikube.com"
    }
  ],
  "custom:operator_id": "thinkspace",
  "custom:company_ids": "["company-1","company-2"]",
  "custom:role": "member_user",
  "custom:auth_provider": "Yardi",
  "iat": 1739520000,
  "exp": 1739523600
}
```

### Custom Attributes (c3scan-specific)
These are added to Cognito user records and included in tokens:

| Attribute | Type | Description |
|-----------|------|-------------|
| `custom:operator_id` | String | Operator tenant ID |
| `custom:company_ids` | String | JSON array of company IDs |
| `custom:role` | String | User role (member_user, operator_staff, etc) |
| `custom:auth_provider` | String | Original IdP (Yardi, Google, etc) |
| `custom:location_ids` | String | For staff: accessible locations |

## API Endpoints

### GET /auth/detect-provider
Returns Cognito configuration based on operator.

### GET /auth/callback
Handles Cognito OAuth callback, exchanges code for tokens.

### POST /auth/refresh
Refreshes access token using refresh token.

### POST /auth/logout
Revokes tokens and clears session.

## Database Schema Updates

### Existing: user_accounts table
```sql
-- Add fields for Cognito integration
ALTER TABLE user_accounts ADD COLUMN cognito_sub UUID;
ALTER TABLE user_accounts ADD COLUMN auth_provider VARCHAR(50);
ALTER TABLE user_accounts ADD COLUMN idp_user_id VARCHAR(255);
ALTER TABLE user_accounts ADD COLUMN last_idp_login TIMESTAMPTZ;

-- Unique constraint on cognito_sub within operator
CREATE UNIQUE INDEX idx_user_cognito_sub 
  ON user_accounts(cognito_sub, operator_id) 
  WHERE cognito_sub IS NOT NULL;
```

### New: user_identities table
```sql
-- Track multiple identities per user (if needed)
CREATE TABLE user_identities (
  identity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_accounts(user_id),
  provider_type VARCHAR(50),      -- 'yardi', 'google', 'cognito'
  provider_user_id VARCHAR(255),  -- User ID from IdP
  provider_email VARCHAR(255),
  provider_data JSONB,            -- Raw claims from IdP
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, provider_type),
  UNIQUE(provider_type, provider_user_id, operator_id)
);
```

## Implementation Phases

### Phase 1: Cognito Foundation
1. Create Cognito User Pool
2. Configure app client with OAuth settings
3. Set up Cognito domain
4. Configure Google as federated IdP (fallback)
5. Implement `/auth/detect-provider` endpoint
6. Implement `/auth/callback` endpoint
7. Update login UI with Cognito-hosted UI redirect

### Phase 2: Yardi Integration
1. Get Yardi OIDC endpoints from admin
2. Add Yardi as federated IdP in Cognito
3. Configure attribute mapping
4. Test end-to-end Yardi → Cognito → c3scan flow
5. Update detect-provider to suggest Yardi for thinkspace.com emails

### Phase 3: Multi-Operator Support
1. Add operator-specific IdP configurations
2. Implement domain-to-operator mapping
3. Add 25N, Blankspaces IdPs
4. Test cross-operator isolation

## Security Considerations

### Token Validation
```typescript
// c3scan must validate:
1. JWT signature (via Cognito JWKS endpoint)
2. Token expiration (exp claim)
3. Audience (aud matches app client ID)
4. Issuer (iss matches Cognito user pool)
5. Custom claims (operator_id matches hostname)
```

### CSRF Protection
- State parameter required in OAuth flow
- State stored in httpOnly cookie
- Validated on callback

### Session Management
- Access token: 1 hour (Cognito default)
- Refresh token: 30 days (configurable)
- Refresh tokens rotated on use
- Logout revokes tokens via Cognito global sign-out

## Environment Variables

```bash
# AWS Cognito
AWS_REGION=us-west-2
COGNITO_USER_POOL_ID=us-west-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # If using confidential client
COGNITO_DOMAIN=c3scan-prod.auth.us-west-2.amazoncognito.com

# IdP Configurations (stored in DB or env)
YARDI_OIDC_CLIENT_ID=c3scan-thinkspace
YARDI_OIDC_CLIENT_SECRET=xxxxxxxxxx
YARDI_OIDC_ISSUER=https://thinkspace.yardikube.com
GOOGLE_OIDC_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
GOOGLE_OIDC_CLIENT_SECRET=xxxxxxxxxx
```

## Testing Strategy

### Unit Tests
- Token validation logic
- Provider detection logic
- Attribute mapping

### Integration Tests
- Cognito token exchange
- Yardi → Cognito federation
- Google → Cognito federation

### E2E Tests
- Full login flow with each IdP
- Token refresh
- Logout and session cleanup
- Cross-operator access denial

## Rollback Plan

If issues arise:
1. Disable Yardi IdP in Cognito (revert to Google only)
2. Or bypass Cognito entirely and use Supabase Auth directly
3. Feature flag for gradual rollout per operator

## Documentation

- [Cognito OIDC Federation Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-oidc-idp.html)
- [Cognito Token Endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html)
- [Yardi Kube API Integration](./yardi-kube-api-reference.md)
