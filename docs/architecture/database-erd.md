# C3Scan Database Schema ERD

Generated from Supabase `c3scan` database schema.

## Legend

- **Tables** (solid rectangles) - Writable entities
- **Views** (dashed rectangles) - Read-only, do not write directly
- **PK** - Primary Key
- **FK** - Foreign Key
- **V** - View (read-only)

---

## Core Entity Relationship Diagram

```mermaid
erDiagram
    %% Core Tables
    operator {
        uuid operator_id PK
        text operator_name
        boolean is_active
        text email_domain
        varchar slug
        varchar custom_domain
        varchar brand_primary_color
        text brand_logo_url
        timestamptz created_at
        timestamptz updated_at
    }

    location {
        uuid location_id PK
        uuid operator_id FK
        text location_name
        text address_line1
        text address_line2
        text city
        text state_province
        text postal_code
        char country_code
        integer property_id FK
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    company {
        uuid company_id PK
        uuid operator_id FK
        text system
        text external_id
        integer property_id FK
        text company_name
        text mailbox_id
        timestamptz last_verified
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    mailbox {
        uuid mailbox_id PK
        uuid operator_id FK
        uuid location_id FK
        uuid company_id FK
        text mailbox_label
        text pmb_number
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    user_account {
        uuid user_id PK
        uuid auth_user_id
        citext email
        text display_name
        text user_type
        uuid operator_id FK
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    company_alias {
        uuid company_alias_id PK
        uuid company_id FK
        text company_external_id
        integer property_id FK
        text alias_type
        text alias_name
        text alias_name_normalized
        text mailbox_id
        boolean is_active
        timestamptz effective_from
        timestamptz effective_to
        timestamptz created_at
        timestamptz updated_at
    }

    %% Mail Items
    mail_item {
        uuid mail_item_id PK
        uuid operator_id FK
        uuid location_id FK
        uuid mailbox_id FK
        uuid scan_session_id FK
        timestamptz received_at
        timestamptz stored_at
        text status
        boolean is_active
        text match_method
        float match_confidence
        text app_version
        float confidence_score
        text ocr_text
        text photo_url
        text scan_mode
        timestamptz created_at
        timestamptz updated_at
    }

    mail_item_image {
        uuid mail_item_image_id PK
        uuid operator_id FK
        uuid mail_item_id FK
        text image_type
        text storage_path
        text mime_type
        bigint byte_size
        int original_width
        int original_height
        int uploaded_width
        int uploaded_height
        float compression_quality
        text sha256
        timestamptz created_at
    }

    ocr_extraction {
        uuid ocr_extraction_id PK
        uuid operator_id FK
        uuid mail_item_id FK
        text source
        text model_version
        float confidence_score
        int processing_time_ms
        jsonb roi
        jsonb text_lines
        text raw_text
        timestamptz created_at
    }

    mail_event {
        uuid mail_event_id PK
        uuid operator_id FK
        uuid mail_item_id FK
        text event_type
        jsonb event_payload
        timestamptz event_at
        uuid created_by_user_id FK
    }

    %% Requests
    mail_request {
        uuid mail_request_id PK
        uuid operator_id FK
        uuid mail_item_id FK
        uuid requested_by_user_id FK
        text request_type
        text request_status
        jsonb request_payload
        timestamptz requested_at
        timestamptz updated_at
    }

    %% User Access & Roles
    user_role {
        uuid user_role_id PK
        uuid user_id FK
        uuid operator_id FK
        uuid location_id FK
        text role_type
        boolean is_active
        timestamptz created_at
    }

    user_mailbox_access {
        uuid user_mailbox_access_id PK
        uuid operator_id FK
        uuid user_id FK
        uuid mailbox_id FK
        text access_level
        boolean is_active
        timestamptz granted_at
        timestamptz revoked_at
    }

    user_operators {
        uuid id PK
        uuid user_id
        uuid operator_id FK
        text email
        text role
        boolean is_active
        timestamptz first_login
        timestamptz last_login
        timestamptz created_at
        timestamptz updated_at
    }

    %% Alias Suggestions & Submissions
    alias_suggestion {
        uuid alias_suggestion_id PK
        uuid operator_id FK
        uuid location_id FK
        uuid company_id FK
        text suggested_alias
        text suggested_alias_normalized
        uuid ocr_extraction_id FK
        text status
        uuid created_by_user_id FK
        uuid decided_by_user_id FK
        timestamptz decided_at
        timestamptz created_at
    }

    alias_submissions {
        uuid submission_id PK
        uuid submitter_user_id
        text submitter_email
        uuid company_id FK
        text proposed_alias_name
        text proposed_alias_name_normalized
        text alias_type
        text submission_reason
        text employee_notes
        uuid source_mail_scan_id FK
        text source_ocr_text
        uuid location_id FK
        text device_id
        text review_status
        uuid reviewed_by
        timestamptz reviewed_at
        text review_notes
        uuid promoted_to_alias_id FK
        timestamptz promoted_at
        text rejection_reason
        timestamptz created_at
        timestamptz updated_at
    }

    %% Batch Ingest
    ingest_batch {
        uuid ingest_batch_id PK
        uuid operator_id FK
        uuid location_id FK
        uuid device_id FK
        uuid user_id FK
        text client_batch_id
        text status
        text error
        timestamptz started_at
        timestamptz completed_at
        timestamptz created_at
    }

    ingest_batch_item {
        uuid ingest_batch_item_id PK
        uuid ingest_batch_id FK
        text local_scan_id
        uuid mail_item_id FK
        text status
        text error
        timestamptz created_at
    }

    %% Device & Notifications
    device_registration {
        uuid device_id PK
        uuid user_id FK
        text platform
        text device_name
        text os_version
        text app_version
        text build_number
        text push_token
        timestamptz push_token_updated_at
        timestamptz last_seen_at
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    notification {
        uuid notification_id PK
        uuid operator_id FK
        uuid user_id FK
        text notification_type
        jsonb payload
        timestamptz created_at
    }

    notification_delivery {
        uuid notification_delivery_id PK
        uuid notification_id FK
        uuid device_id FK
        text status
        timestamptz sent_at
        timestamptz delivered_at
        timestamptz read_at
        text error
    }

    %% Integration Config
    operator_integration_config {
        uuid operator_integration_config_id PK
        uuid operator_id FK
        varchar integration_type
        jsonb config_json
        boolean is_enabled
        timestamptz created_at
        timestamptz updated_at
        uuid created_by
    }

    %% Relationships
    operator ||--o{ location : "has many"
    operator ||--o{ company : "has many"
    operator ||--o{ mailbox : "has many"
    operator ||--o{ mail_item : "has many"
    operator ||--o{ user_account : "has many"
    operator ||--o{ operator_integration_config : "has many"
    
    location ||--o{ mailbox : "has many"
    location ||--o{ mail_item : "has many"
    location ||--o{ alias_suggestion : "has many"
    
    company ||--o{ mailbox : "has many"
    company ||--o{ company_alias : "has many"
    company ||--o{ alias_submissions : "has many"
    
    mailbox ||--o{ mail_item : "receives"
    mailbox ||--o{ user_mailbox_access : "has access records"
    
    user_account ||--o{ user_role : "has roles"
    user_account ||--o{ user_mailbox_access : "has access"
    user_account ||--o{ device_registration : "has devices"
    
    mail_item ||--o{ mail_item_image : "has images"
    mail_item ||--o{ ocr_extraction : "has OCR data"
    mail_item ||--o{ mail_event : "has events"
    mail_item ||--o{ mail_request : "has requests"
    
    scan_session ||--o{ mail_item : "contains"
    
    ingest_batch ||--o{ ingest_batch_item : "contains"
    
    notification ||--o{ notification_delivery : "delivered to"
    device_registration ||--o{ notification_delivery : "receives"
```

---

## Views (Read-Only)

**Do not write directly to these views.** They are computed from base tables.

| View Name | Purpose | Base Tables |
|-----------|---------|-------------|
| `operator_v` | Operator summary | `operator` |
| `location_v` | Location with resolved fields | `location`, `operator` |
| `company_v` | Company with resolved fields | `company`, `operator` |
| `company_alias_resolved_v` | Aliases with company names | `company_alias`, `company` |
| `company_alias_resolved_v` | Aliases with full resolution | `company_alias`, `company`, `location` |
| `v_member_mailbox_access` | Member access to mailboxes | `user_mailbox_access`, `mailbox`, `company` |
| `v_mail_item_inbox` | Mail items for inbox display | `mail_item`, `mail_request` |
| `v_admin_ocr_latest_per_mail_item` | Latest OCR per mail item | `ocr_extraction` |
| `v_admin_pending_alias_suggestions` | Pending suggestions for admin | `alias_suggestion`, `company`, `location`, `operator` |
| `v_admin_ingest_batches` | Batch ingest status | `ingest_batch`, `operator`, `location`, `device_registration` |
| `v_admin_notification_status` | Notification delivery status | `notification`, `device_registration` |
| `pending_submissions_detail` | Pending alias submissions | `alias_submissions`, `companies` |
| `staff_submission_stats` | Stats per staff member | `alias_submissions` |

---

## Table Reference

### operator
Top-level tenant entity (coworking operator).

| Column | Type | Notes |
|--------|------|-------|
| operator_id | uuid | PK, default: gen_random_uuid() |
| operator_name | text | Operator display name |
| is_active | boolean | default: true |
| email_domain | text | Used for mobile auth operator resolution |
| slug | varchar(50) | URL-friendly (e.g., "thinkspace") |
| custom_domain | varchar(255) | White-label CNAME |
| brand_primary_color | varchar(7) | Hex color (e.g., "#0066CC") |
| brand_logo_url | text | Logo URL |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

### location
Physical site; scopes staff activity and mail storage.

| Column | Type | Notes |
|--------|------|-------|
| location_id | uuid | PK, default: gen_random_uuid() |
| operator_id | uuid | FK → operator.operator_id |
| location_name | text | Display name |
| address_line1 | text | |
| address_line2 | text | |
| city | text | |
| state_province | text | |
| postal_code | text | |
| country_code | char(2) | ISO country code |
| property_id | integer | External system reference |
| is_active | boolean | default: true |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

### company
A business or entity that receives mail.

| Column | Type | Notes |
|--------|------|-------|
| company_id | uuid | PK, default: gen_random_uuid() |
| operator_id | uuid | FK → operator.operator_id |
| system | text | Source system identifier |
| external_id | text | External system ID |
| property_id | integer | FK → location.property_id |
| company_name | text | Display name |
| mailbox_id | text | Reference to primary mailbox |
| last_verified | timestamptz | Last validation timestamp |
| is_active | boolean | default: true |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

### mailbox
Customer mailbox (virtual office).

| Column | Type | Notes |
|--------|------|-------|
| mailbox_id | uuid | PK, default: gen_random_uuid() |
| operator_id | uuid | FK → operator.operator_id |
| location_id | uuid | FK → location.location_id |
| company_id | uuid | FK → company.company_id |
| mailbox_label | text | Display label |
| pmb_number | text | Private mailbox number |
| is_active | boolean | default: true |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

### company_alias
Aliases for company matching (DBA names, authorized members, OCR variants).

| Column | Type | Notes |
|--------|------|-------|
| company_alias_id | uuid | PK, default: gen_random_uuid() |
| company_id | uuid | FK → company.company_id |
| company_external_id | text | External reference |
| property_id | integer | FK → location.property_id |
| alias_type | text | Type: dba, authorized_member, ocr_variant |
| alias_name | text | Original alias name |
| alias_name_normalized | text | Normalized for matching |
| mailbox_id | text | Associated mailbox |
| is_active | boolean | default: true |
| effective_from | timestamptz | Validity start |
| effective_to | timestamptz | Validity end |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

### mail_item
A scanned/received piece of mail.

| Column | Type | Notes |
|--------|------|-------|
| mail_item_id | uuid | PK, default: gen_random_uuid() |
| operator_id | uuid | FK → operator.operator_id |
| location_id | uuid | FK → location.location_id |
| mailbox_id | uuid | FK → mailbox.mailbox_id |
| scan_session_id | uuid | FK → scan_session.scan_session_id |
| received_at | timestamptz | default: now() |
| stored_at | timestamptz | When physically stored |
| status | text | received, processed, etc. |
| is_active | boolean | default: true |
| match_method | text | How matched: fuzzy, manual, etc. |
| match_confidence | float | Confidence score 0-1 |
| app_version | text | Scanner app version |
| confidence_score | float | OCR confidence |
| ocr_text | text | Extracted OCR text |
| photo_url | text | Image URL (deprecated, use storage_path) |
| scan_mode | text | Scan mode used |
| created_at | timestamptz | default: now() |
| updated_at | timestamptz | default: now() |

### mail_item_image
Images associated with mail items.

| Column | Type | Notes |
|--------|------|-------|
| mail_item_image_id | uuid | PK, default: gen_random_uuid() |
| operator_id | uuid | FK → operator.operator_id |
| mail_item_id | uuid | FK → mail_item.mail_item_id |
| image_type | text | envelope, label, interior, etc. |
| storage_path | text | Supabase Storage path |
| mime_type | text | image/jpeg, image/png, etc. |
| byte_size | bigint | File size in bytes |
| original_width | int | Original image width |
| original_height | int | Original image height |
| uploaded_width | int | Uploaded/processed width |
| uploaded_height | int | Uploaded/processed height |
| compression_quality | float | Compression ratio |
| sha256 | text | File hash for deduplication |
| created_at | timestamptz | default: now() |

### ocr_extraction
OCR processing results for mail items.

| Column | Type | Notes |
|--------|------|-------|
| ocr_extraction_id | uuid | PK, default: gen_random_uuid() |
| operator_id | uuid | FK → operator.operator_id |
| mail_item_id | uuid | FK → mail_item.mail_item_id |
| source | text | ios, admin, etc. |
| model_version | text | OCR model used |
| confidence_score | float | Overall confidence |
| processing_time_ms | int | Processing duration |
| roi | jsonb | Region of interest coordinates |
| text_lines | jsonb | Array of text lines with coords |
| raw_text | text | Full extracted text |
| created_at | timestamptz | default: now() |

### alias_suggestion
Unmatched mail suggestions for admin review.

| Column | Type | Notes |
|--------|------|-------|
| alias_suggestion_id | uuid | PK, default: gen_random_uuid() |
| operator_id | uuid | FK → operator.operator_id |
| location_id | uuid | FK → location.location_id |
| company_id | uuid | FK → company.company_id (if matched) |
| suggested_alias | text | Suggested company name |
| suggested_alias_normalized | text | Normalized for matching |
| ocr_extraction_id | uuid | FK → ocr_extraction.ocr_extraction_id |
| status | text | pending, approved, rejected |
| created_by_user_id | uuid | FK → user_account.user_id |
| decided_by_user_id | uuid | FK → user_account.user_id |
| decided_at | timestamptz | When decision made |
| created_at | timestamptz | default: now() |

---

## Writeable vs Read-Only Summary

### Tables (Writable)
- `operator`
- `location`
- `company`
- `mailbox`
- `company_alias`
- `user_account`
- `user_role`
- `user_mailbox_access`
- `user_operators`
- `mail_item`
- `mail_item_image`
- `mail_request`
- `mail_event`
- `ocr_extraction`
- `alias_suggestion`
- `alias_submissions`
- `ingest_batch`
- `ingest_batch_item`
- `scan_session`
- `device_registration`
- `notification`
- `notification_delivery`
- `operator_integration_config`
- `scanned_mail` (legacy, being phased out)

### Views (Read-Only - DO NOT WRITE)
- `operator_v`
- `location_v`
- `company_v`
- `company_alias_resolved_v`
- `company_alias_resolved_v`
- `v_member_mailbox_access`
- `v_mail_item_inbox`
- `v_admin_ocr_latest_per_mail_item`
- `v_admin_pending_alias_suggestions`
- `v_admin_ingest_batches`
- `v_admin_notification_status`
- `pending_submissions_detail`
- `staff_submission_stats`

### Legacy Tables (Migrating)
- `companies` → use `company`
- `locations` → use `location`
- `company_aliases` → use `company_alias`
- `scan_sessions` → use `scan_session`
