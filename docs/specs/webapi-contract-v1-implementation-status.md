# WebAPI Contract v1 - Implementation Status

Last updated: 2026-02-14

## Implementation Summary

| Section | Component | Status | Location |
|---------|-----------|--------|----------|
| **0. Non-negotiables** | Operator resolution | ✅ Implemented | middleware.ts |
| | Namespace separation | ✅ Implemented | Route structure |
| | Token lifecycle | ✅ Implemented | /api/auth/callback |
| **1. Roles & Claims** | JWT claims structure | ✅ Implemented | ACC v1.0 |
| | Object access rules | ✅ Implemented | All /api/admin/* routes |
| **2. Compliance** | Grace period logic | ⏳ Partial | DB schema ready |
| **3. Endpoints** | Admin mail-items | ✅ Implemented | /api/admin/mail-items/* |
| | Admin requests | ✅ Implemented | /api/admin/requests/* |
| | Admin mailboxes | ✅ Implemented | /api/admin/mailboxes |
| | Admin companies | ✅ Implemented | /api/admin/companies/* |
| | Admin aliases | ✅ Implemented | /api/admin/alias-suggestions |
| **4. Error Codes** | All ACC v1.0 codes | ✅ Implemented | middleware.ts + routes |
| **5. Security** | Emergency auth | ✅ Implemented | /api/auth/emergency-login |
| | Maintenance mode | ✅ Implemented | middleware.ts |
| | Audit logging | ✅ Implemented | All admin routes |

---

## Implemented Admin APIs

### Mail Items
```
POST /api/admin/mail-items              ✅ Create intake record
GET  /api/admin/mail-items              ✅ List with filters
GET  /api/admin/mail-items/{id}         ✅ Get detail
GET  /api/admin/mail-items/staging      ✅ View staging data
GET  /api/admin/mail-items/staging/{id} ✅ Staging detail
```

### Requests
```
GET  /api/admin/requests                ✅ List with filters
POST /api/admin/requests/{id}/status    ✅ Update status
```

### Mailboxes
```
GET  /api/admin/mailboxes               ✅ List mailboxes
POST /api/admin/mailboxes               ✅ Create mailbox
```

### Companies
```
GET  /api/admin/companies               ✅ Search companies
GET  /api/admin/companies/{id}          ✅ Detail with aliases
```

### Company Aliases
```
PATCH /api/admin/company-aliases/{id}   ✅ Edit/Archive/Restore
```

### Alias Suggestions
```
GET  /api/admin/alias-suggestions                    ✅ List suggestions
POST /api/admin/alias-suggestions/{id}/decision      ✅ Approve/Reject
```

### Authentication
```
GET  /api/auth/detect-provider          ✅ Get Cognito config
GET  /api/auth/callback                 ✅ OAuth callback
POST /api/auth/emergency-login          ✅ Break-glass auth
```

### System
```
GET  /api/admin/maintenance-mode        ✅ Check status
POST /api/admin/maintenance-mode        ✅ Toggle maintenance
```

---

## Admin UI Pages Implemented

| Page | Path | Features |
|------|------|----------|
| **Emergency Login** | /admin/emergency-login | TOTP-based break-glass access |
| **Companies** | /admin/companies | Search, list, alias count |
| **Company Detail** | /admin/companies/{id} | View/edit aliases, archive/restore |
| **Aliases** | /admin/aliases | Approve/reject suggestions |
| **Maintenance** | /admin/settings/maintenance | Toggle, custom message |

---

## ACC v1.0 Compliance

### Operator Context Resolution
```typescript
// middleware.ts
const effectiveOperatorId = resolveOperatorContext(token, requestHeaders);
requestHeaders.set('X-Effective-Operator-Id', effectiveOperatorId);
```

### JWT Claims Implemented
```json
{
  "sub": "cognito-sub",
  "custom:user_id": "c3scan-user-id",
  "custom:roles": ["operator_admin"],
  "custom:operator_id": "thinkspace",
  "custom:location_ids": ["loc-1", "loc-2"],
  "custom:all_locations": false,
  "email": "admin@thinkspace.com",
  "iat": 1739520000,
  "exp": 1739523600
}
```

### Error Codes Implemented
- `OPERATOR_CONTEXT_REQUIRED` - 403
- `OPERATOR_CONTEXT_CONFLICT` - 403
- `OPERATOR_NOT_FOUND` - 404
- `LOCATION_FORBIDDEN` - 403
- `RESOURCE_NOT_FOUND` - 404
- `VALIDATION_FAILED` - 400
- `CONFLICT` - 409

---

## Security Features

### Emergency Authentication
- Endpoint: `POST /api/auth/emergency-login`
- Requires: email, password, TOTP code, reason
- Rate limit: 3 attempts/hour per IP
- Session: 30 minutes
- Audit: All attempts logged

### Maintenance Mode
- Customer site: Shows maintenance page
- Admin site: Fully accessible
- Control: Settings → Maintenance
- Cache: 30-second TTL

### Audit Logging
All admin mutations logged:
- Actor user ID and roles
- Effective operator ID
- Endpoint, method, event type
- Resource type and ID
- Previous/new state
- Timestamp and IP

---

## Pending Implementation

### Compliance Endpoints
```
GET  /api/admin/compliance              ⏳ List compliance cases
GET  /api/admin/compliance/{id}         ⏳ Get case detail
POST /api/admin/compliance/{id}/approve ⏳ Approve compliance
POST /api/admin/compliance/{id}/reject  ⏳ Reject compliance
```

### Customer Portal APIs
```
GET  /api/app/mail-items                ⏳ List member mail
POST /api/app/requests                  ⏳ Submit request
GET  /api/app/compliance                ⏳ View compliance status
```

### Advanced Features
- Request detail endpoint with timeline
- Compliance document upload
- Real-time notifications
- Batch operations

---

## Files Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── callback/route.ts           ✅ OAuth callback
│   │   ├── detect-provider/route.ts    ✅ Provider detection
│   │   └── emergency-login/route.ts    ✅ Emergency auth
│   └── admin/
│       ├── mail-items/
│       │   ├── route.ts                ✅ List/Create
│       │   ├── [mail_item_id]/route.ts ✅ Detail
│       │   └── staging/                ✅ Staging viewer
│       ├── requests/
│       │   ├── route.ts                ✅ List
│       │   └── [request_id]/
│       │       └── status/route.ts     ✅ Update status
│       ├── mailboxes/
│       │   └── route.ts                ✅ List/Create
│       ├── companies/
│       │   ├── route.ts                ✅ Search
│       │   └── [company_id]/route.ts   ✅ Detail
│       ├── company-aliases/
│       │   └── [id]/route.ts           ✅ Edit/Archive
│       ├── alias-suggestions/
│       │   ├── route.ts                ✅ List
│       │   └── [id]/
│       │       └── decision/route.ts   ✅ Approve/Reject
│       └── maintenance-mode/
│           └── route.ts                ✅ Toggle/Status
├── admin/
│   ├── emergency-login/page.tsx        ✅ Emergency UI
│   ├── companies/
│   │   ├── page.tsx                    ✅ Company list
│   │   └── [company_id]/page.tsx       ✅ Company detail
│   ├── aliases/page.tsx                ✅ Alias approval
│   └── settings/
│       └── maintenance/page.tsx        ✅ Maintenance control
└── maintenance/page.tsx                ✅ Customer maintenance page

middleware.ts                           ✅ Operator context + Maintenance

supabase/migrations/
├── 20250214160000_create_audit_logs.sql           ✅ Audit table
├── 20250214170000_update_auth_tables_acc_v1.sql   ✅ Auth columns
├── 20250214200000_emergency_access.sql            ✅ Emergency auth
└── 20250214210000_system_settings.sql             ✅ Maintenance mode
```

---

## Testing Checklist

- [ ] OAuth login flow end-to-end
- [ ] Emergency login with TOTP
- [ ] Maintenance mode toggle
- [ ] Operator context enforcement
- [ ] Location scoping for location_staff
- [ ] Alias approval workflow
- [ ] Company search and detail
- [ ] Audit log verification
- [ ] Rate limiting on emergency login
- [ ] Token expiration handling

---

## Notes

### Role-Based Access Matrix

| Endpoint | operator_admin | operator_staff | location_staff |
|----------|---------------|----------------|----------------|
| GET /mail-items | ✅ | ✅ | ✅ (scoped) |
| POST /mail-items | ✅ | ✅ | ❌ |
| POST /requests/{id}/status | ✅ | ✅ | ❌ |
| POST /mailboxes | ✅ | ❌ | ❌ |
| PATCH /company-aliases/{id} | ✅ | ✅ | ❌ |
| POST /maintenance-mode | ✅ | ❌ | ❌ |

### Next Priority Items

1. **Compliance endpoints** - Required for MVP
2. **Customer portal APIs** - For member access
3. **Image upload/signed URLs** - For envelope images
4. **Real-time updates** - WebSocket or SSE for notifications
5. **Bulk operations** - Batch approve, export, etc.
