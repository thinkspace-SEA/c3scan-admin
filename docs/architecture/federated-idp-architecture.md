# Federated Identity Provider Architecture (c3scan)

## Status: IMPLEMENTED

Last updated: 2026-02-14

## Overview

AWS Cognito serves as the centralized identity broker, federating authentication across multiple IdPs while presenting a single, consistent authentication interface to c3scan applications.

### Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Cognito User Pool | ✅ Ready | CloudFormation template created |
| Google OAuth | ✅ Ready | Fallback IdP configured |
| Yardi OIDC | ⏳ Pending | Waiting for endpoints from Yardi |
| Detect Provider API | ✅ Implemented | `/api/auth/detect-provider` |
| Callback Handler | ✅ Implemented | `/api/auth/callback` with ACC v1.0 |
| Emergency Auth | ✅ Implemented | Break-glass for OAuth failures |
| Maintenance Mode | ✅ Implemented | Customer site toggle |
| Admin APIs | ✅ Implemented | Full CRUD for mail/requests/mailboxes |
| ACC v1.0 Compliance | ✅ Implemented | Operator context, JWT claims, audit logging |

## Architecture Diagram

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
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Customer Portal │  │  Admin Portal    │  │  Emergency Auth  │
│  (/app)          │  │  (/admin)        │  │  (/admin/emer-  │
│                  │  │                  │  │   gency-login)   │
│  OAuth via       │  │  OAuth via       │  │                  │
│  Cognito         │  │  Cognito         │  │  Direct DB auth  │
│                  │  │                  │  │  (break-glass)   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Admin Console Features

### Authentication Layer
- **Federated IdP**: Cognito with Yardi/Google
- **Emergency Access**: `/admin/emergency-login` for OAuth failures
- **Role-based Access**: operator_admin, operator_staff, location_staff
- **ACC v1.0 Compliance**: Full operator context resolution

### Maintenance Mode
- **Location**: Settings → Maintenance
- **Function**: Toggle customer site on/off
- **Preserves**: Admin access during maintenance
- **Customer sees**: Friendly maintenance page with custom message

### API Endpoints Implemented

#### Authentication
```
GET  /api/auth/detect-provider       # Returns Cognito config
GET  /api/auth/callback              # OAuth callback handler
POST /api/auth/emergency-login       # Break-glass auth
POST /api/admin/maintenance-mode     # Toggle maintenance
```

#### Admin APIs (Full CRUD)
```
# Mail Items
POST /api/admin/mail-items           # Create intake record
GET  /api/admin/mail-items           # List with filters
GET  /api/admin/mail-items/{id}      # Get detail
GET  /api/admin/mail-items/staging   # View staging data

# Requests
GET  /api/admin/requests             # List requests
POST /api/admin/requests/{id}/status # Update status

# Mailboxes
GET  /api/admin/mailboxes            # List mailboxes
POST /api/admin/mailboxes            # Create mailbox

# Companies
GET  /api/admin/companies            # Search companies
GET  /api/admin/companies/{id}       # Detail with aliases

# Company Aliases
PATCH /api/admin/company-aliases/{id} # Edit/archive alias

# Alias Suggestions
GET  /api/admin/alias-suggestions              # List pending
POST /api/admin/alias-suggestions/{id}/decision # Approve/reject
```

## ACC v1.0 (Admin Context Contract) Implementation

### JWT Claims Structure
```json
{
  "sub": "cognito-user-uuid",
  "custom:user_id": "c3scan-user-uuid",
  "custom:roles": ["operator_admin", "operator_staff"],
  "custom:operator_id": "thinkspace",
  "custom:location_ids": ["loc-1", "loc-2"],
  "custom:all_locations": false,
  "email": "admin@thinkspace.com",
  "iat": 1739520000,
  "exp": 1739523600
}
```

### Operator Context Resolution
1. **Token has operator_id** → Use it (reject X-Operator-Id header)
2. **Platform admin token** → Require X-Operator-Id header
3. **No context** → Reject with `OPERATOR_CONTEXT_REQUIRED`

### Error Codes Implemented
- `OPERATOR_CONTEXT_REQUIRED` - No operator context in token
- `OPERATOR_CONTEXT_CONFLICT` - Token context conflicts with header
- `OPERATOR_NOT_FOUND` - Operator doesn't exist
- `LOCATION_FORBIDDEN` - User lacks location access
- `RESOURCE_NOT_FOUND` - Object not found or wrong operator

### Audit Logging
All mutations logged to `audit_logs` table:
- Actor user ID and roles
- Effective operator ID
- Endpoint and method
- Resource type and ID
- Previous/new state (for updates)
- Success/failure result

## Database Schema (Auth-Related)

### user_account
```sql
ALTER TABLE user_account ADD COLUMN cognito_sub UUID UNIQUE;
ALTER TABLE user_account ADD COLUMN auth_provider VARCHAR(50);
ALTER TABLE user_account ADD COLUMN roles JSONB DEFAULT '[]';
ALTER TABLE user_account ADD COLUMN location_ids UUID[] DEFAULT '{}';
ALTER TABLE user_account ADD COLUMN is_emergency_admin BOOLEAN DEFAULT false;
ALTER TABLE user_account ADD COLUMN emergency_password_hash TEXT;
ALTER TABLE user_account ADD COLUMN emergency_mfa_secret TEXT;
```

### user_identities
```sql
CREATE TABLE user_identities (
  identity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_account(user_id),
  provider_type VARCHAR(50),
  provider_user_id VARCHAR(255),
  provider_email VARCHAR(255),
  provider_data JSONB,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  actor_user_id UUID,
  actor_roles JSONB,
  effective_operator_id UUID,
  endpoint TEXT,
  method TEXT,
  event_type TEXT,
  resource_type TEXT,
  resource_id TEXT,
  result TEXT,
  previous_state JSONB,
  new_state JSONB,
  metadata JSONB
);
```

### system_settings (Maintenance Mode)
```sql
CREATE TABLE system_settings (
  setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operator(operator_id),
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES user_account(user_id),
  UNIQUE(operator_id, setting_key)
);

-- Maintenance mode setting
INSERT INTO system_settings (setting_key, setting_value)
VALUES ('maintenance_mode', '{"is_enabled": false, "message": "..."}');
```

### emergency_access_logs
```sql
CREATE TABLE emergency_access_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_account(user_id),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN,
  failure_reason TEXT,
  reason_provided TEXT,
  actions_taken JSONB
);
```

## Emergency Authentication

### Use Case
When OAuth/Cognito/DNS is down, admins can still access the system.

### Endpoint
```
POST /api/auth/emergency-login
Body: {
  "email": "emergency@thinkspace.com",
  "password": "...",
  "totpCode": "123456",
  "reason": "Google OAuth is down"
}
```

### Security Features
- Rate limited: 3 attempts/hour per IP
- MFA required: Password + TOTP
- Short session: 30 minutes
- Full audit trail
- Alerts security team
- Read-only by default

### Setup
1. Create emergency admin user in database
2. Set up TOTP in authenticator app
3. Store credentials in 1Password
4. Use `/admin/emergency-login` when needed

## Maintenance Mode

### Customer Impact
- Customer site shows maintenance page
- Admin site remains accessible
- Custom message configurable

### Admin Control
- Settings → Maintenance
- Toggle on/off
- Edit custom message
- Preview customer view

### Implementation
- Middleware checks `system_settings.maintenance_mode`
- Admin routes bypass maintenance check
- 30-second cache to reduce DB load
- Fail-open (site stays up if DB fails)

## Implementation Files

### Infrastructure
- `infrastructure/cognito-federated-idp.yaml` - CloudFormation template
- `infrastructure/DEPLOYMENT.md` - Deployment instructions

### API Routes
- `app/api/auth/detect-provider/route.ts`
- `app/api/auth/callback/route.ts`
- `app/api/auth/emergency-login/route.ts`
- `app/api/admin/maintenance-mode/route.ts`
- `app/api/admin/mail-items/route.ts`
- `app/api/admin/requests/route.ts`
- `app/api/admin/companies/route.ts`
- `app/api/admin/company-aliases/[id]/route.ts`
- `app/api/admin/alias-suggestions/route.ts`

### Middleware
- `middleware.ts` - Operator context + maintenance mode

### Admin UI
- `app/admin/emergency-login/page.tsx`
- `app/admin/settings/maintenance/page.tsx`
- `app/maintenance/page.tsx` - Customer maintenance page

### Database Migrations
- `supabase/migrations/20250214170000_update_auth_tables_acc_v1.sql`
- `supabase/migrations/20250214160000_create_audit_logs.sql`
- `supabase/migrations/20250214200000_emergency_access.sql`
- `supabase/migrations/20250214210000_system_settings.sql`

## Security Considerations

### Token Validation
```typescript
// c3scan validates:
1. JWT signature (via Cognito JWKS)
2. Token expiration (exp claim)
3. Audience (aud matches client ID)
4. Issuer (iss matches user pool)
5. Custom claims (operator_id matches hostname)
```

### CSRF Protection
- State parameter in OAuth flow
- State stored in httpOnly cookie
- Validated on callback

### Session Management
- Access token: 1 hour
- Refresh token: 30 days
- Emergency session: 30 minutes
- Logout revokes via Cognito global sign-out

### Break-Glass Access
- Emergency credentials stored securely
- TOTP required
- All access logged
- Alerts sent on use
- Regular credential rotation

## Environment Variables

```bash
# AWS Cognito
AWS_REGION=us-west-2
COGNITO_USER_POOL_ID=us-west-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
COGNITO_DOMAIN=c3scan-prod.auth.us-west-2.amazoncognito.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Emergency Auth (set up after migration)
# Stored in database, not environment
```

## Deployment Status

### Ready to Deploy
- CloudFormation template for Cognito
- Admin APIs and UI
- Emergency authentication
- Maintenance mode
- ACC v1.0 compliance

### Blocked
- **Yardi OIDC**: Waiting for endpoints from Yardi
- **Apple iOS Auth**: Waiting for Apple Developer enrollment

### Next Steps
1. Obtain Google OAuth credentials
2. Deploy Cognito CloudFormation stack
3. Configure Google as fallback IdP
4. Test emergency authentication
5. Get Yardi OIDC endpoints
6. Add Yardi as federated IdP
7. Complete Apple enrollment for iOS auth

## Documentation

- [Cognito OIDC Federation Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-oidc-idp.html)
- [ACC v1.0 Specification](./webapi-contract-v1.md)
- [Emergency Access Architecture](./emergency-access.md)
- [Database Auth Schema Review](./database-auth-schema-review.md)
- [iOS Google OAuth Handoff](./ios-google-oauth-handoff.md)
