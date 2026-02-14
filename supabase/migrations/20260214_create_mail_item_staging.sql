-- Migration: Create mail_item_staging table for flexible data ingestion
-- 
-- SECURITY NOTICE: This table follows the c3scan Tenancy Isolation Contract
-- Compound Key for mailbox uniqueness: operator_id + location_id + mailbox_id
-- Reference: docs/architecture/auth-tenancy-contract.md

CREATE TABLE IF NOT EXISTS mail_item_staging (
    staging_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- === TENANT SCOPE (Compound Key) ===
    -- These three fields together uniquely identify a mailbox within c3scan
    operator_id UUID NOT NULL,           -- Top tenant boundary (required)
    location_id UUID,                    -- Sub-tenant boundary
    mailbox_id TEXT,                     -- Immutable mailbox boundary (STRING, not UUID)
                                         -- Example: "1614", "Suite 200", "2008"
    
    -- === COMPANY REFERENCE ===
    -- company_id identifies the company that owns this mailbox
    company_id UUID,                     -- From company_alias.company_id
    company_name TEXT,                   -- Human-readable reference
    
    -- === SCAN METADATA ===
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    scanned_by_email TEXT NOT NULL,      -- User who performed the scan
    status TEXT NOT NULL DEFAULT 'pending_processing',
                                         -- pending_processing, processed, failed
    
    -- === IMAGE STORAGE ===
    envelope_image TEXT NOT NULL,        -- Storage path to image file
    
    -- === OCR/MATCHING DATA ===
    ocr_text TEXT,                       -- Raw OCR text from envelope
    ocr_confidence DOUBLE PRECISION DEFAULT 0,
    match_confidence DOUBLE PRECISION DEFAULT 0,
    match_method TEXT,                   -- 'fuzzy_ocr', 'manual_search', 'scan'
    
    -- === PACKAGE INFO ===
    package_type TEXT,                   -- 'standard', 'large', 'oversized'
    carrier TEXT,                        -- Shipping carrier if detected
    tracking_number TEXT,                -- Tracking number if detected
    
    -- === CLIENT TRACKING ===
    client_scan_id TEXT,                 -- UUID from mobile app scan
    image_hash TEXT,                     -- For duplicate detection
    app_version TEXT,                    -- Mobile app version
    
    -- === POST-PROCESSING METADATA ===
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_mail_item_id UUID,         -- FK to final mail_item when processed
    processing_error TEXT,               -- Error message if processing failed
    
    -- === DEBUGGING ===
    raw_payload JSONB,                   -- Full original request payload
    
    -- === TIMESTAMPS ===
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries during post-processing
CREATE INDEX IF NOT EXISTS idx_mail_item_staging_status ON mail_item_staging(status);
CREATE INDEX IF NOT EXISTS idx_mail_item_staging_operator ON mail_item_staging(operator_id);
CREATE INDEX IF NOT EXISTS idx_mail_item_staging_location ON mail_item_staging(location_id);
CREATE INDEX IF NOT EXISTS idx_mail_item_staging_mailbox ON mail_item_staging(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_mail_item_staging_received_at ON mail_item_staging(received_at);

-- Compound index for the unique key lookup
CREATE INDEX IF NOT EXISTS idx_mail_item_staging_compound 
    ON mail_item_staging(operator_id, location_id, mailbox_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mail_item_staging_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mail_item_staging_updated_at ON mail_item_staging;
CREATE TRIGGER trg_mail_item_staging_updated_at
    BEFORE UPDATE ON mail_item_staging
    FOR EACH ROW
    EXECUTE FUNCTION update_mail_item_staging_updated_at();

-- Comments documenting the security model
COMMENT ON TABLE mail_item_staging IS 
    'Staging table for mail items from mobile app. 
     Post-processor moves validated items to mail_item table.
     Compound Key: operator_id + location_id + mailbox_id (all required for uniqueness)';

COMMENT ON COLUMN mail_item_staging.mailbox_id IS 
    'STRING value (e.g., "1614", "Suite 200"). 
     NOT a UUID. Combined with operator_id + location_id for unique identification.';

COMMENT ON COLUMN mail_item_staging.operator_id IS 
    'Top tenant boundary. Required for all queries per auth-tenancy-contract.md';

COMMENT ON COLUMN mail_item_staging.location_id IS 
    'Sub-tenant boundary. Part of compound key for mailbox uniqueness';

COMMENT ON COLUMN mail_item_staging.company_id IS 
    'UUID reference to company. Resolved by post-processor during processing';