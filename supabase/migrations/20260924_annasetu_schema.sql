-- ====================================================================
-- ANNASETU PostgreSQL + PostGIS Core Production Schema
-- Conforms strictly to PRD Section 39, 40, 41 & Phase 1 requirements
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- --------------------------------------------------------------------
-- 1. ENUMS (PRD Section 40: Typed Enums for all State Machines)
-- --------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('DONOR', 'NGO', 'DRIVER', 'ADMIN');

CREATE TYPE verification_status AS ENUM (
    'REGISTERED',
    'DOCUMENTS_SUBMITTED',
    'GOVERNMENT_CHECK',
    'ADMIN_REVIEW',
    'VERIFIED',
    'REJECTED'
);

CREATE TYPE food_category AS ENUM (
    'GRAINS_RICE',
    'CURRIES_GRAVIES',
    'BREADS_ROTI',
    'DAIRY_SWEETS',
    'SNACKS_SAVORIES',
    'FRESH_PRODUCE',
    'PACKAGED_MEALS',
    'BEVERAGES',
    'OTHER'
);

CREATE TYPE dietary_type AS ENUM ('VEG', 'NON_VEG', 'ANY');

CREATE TYPE meal_period AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'OTHER');

CREATE TYPE need_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'PARTIALLY_FULFILLED',
    'FULFILLED',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE donation_status AS ENUM (
    'DRAFT',
    'POSTED',
    'MATCHED',
    'ALLOCATED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'UNMATCHED',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE reservation_status AS ENUM ('HELD', 'CONFIRMED', 'RELEASED', 'EXPIRED');

CREATE TYPE vehicle_class AS ENUM (
    'MOTORCYCLE',
    'SCOOTER',
    'SMALL_VAN',
    'VAN',
    'MINI_TRUCK',
    'TRUCK'
);

CREATE TYPE job_status AS ENUM (
    'AVAILABLE',
    'ACCEPTED',
    'ARRIVING_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'AT_STOP',
    'DELIVERED',
    'CANCELLED',
    'FAILED_PICKUP',
    'FAILED_DELIVERY',
    'REASSIGNMENT_REQUIRED'
);

CREATE TYPE ledger_entry_type AS ENUM (
    'WALLET_TOPUP',
    'RESERVE_HOLD',
    'RELEASE_HOLD',
    'FINAL_CHARGE',
    'DRIVER_PAYOUT',
    'PLATFORM_FEE'
);

CREATE TYPE integrity_verdict AS ENUM (
    'NO_VISIBLE_DISCREPANCY',
    'POSSIBLE_PACKAGE_DISCREPANCY',
    'AI_UNAVAILABLE_MANUAL_REVIEW'
);

-- --------------------------------------------------------------------
-- 2. CONFIGURATION SYSTEM (PRD Section 41)
-- --------------------------------------------------------------------
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. IDENTITY & PROFILES
-- --------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    verification_status verification_status NOT NULL DEFAULT 'REGISTERED',
    location_address TEXT,
    coordinates GEOMETRY(Point, 4326),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE donor_details (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    business_type VARCHAR(100) NOT NULL,
    gstin VARCHAR(15),
    fssai_licence VARCHAR(20),
    authorized_person VARCHAR(255),
    verified_at TIMESTAMPTZ
);

CREATE TABLE ngo_details (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    pan VARCHAR(10),
    ngo_darpan_id VARCHAR(50),
    registration_no VARCHAR(100),
    is_80g_certified BOOLEAN DEFAULT FALSE,
    authorized_rep VARCHAR(255),
    default_capacity_kg NUMERIC(10, 2) NOT NULL DEFAULT 50.0
);

CREATE TABLE driver_details (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    driving_licence_no VARCHAR(50) NOT NULL,
    vehicle_class vehicle_class NOT NULL,
    vehicle_rc_no VARCHAR(50) NOT NULL,
    is_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    completed_deliveries INT NOT NULL DEFAULT 0,
    current_coordinates GEOMETRY(Point, 4326),
    last_location_update TIMESTAMPTZ
);

-- --------------------------------------------------------------------
-- 4. FOOD MARKETPLACE (NEEDS & DONATIONS)
-- --------------------------------------------------------------------
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    food_category food_category NOT NULL,
    dietary_type dietary_type NOT NULL DEFAULT 'VEG',
    quantity_kg NUMERIC(10, 2) NOT NULL,
    remaining_kg NUMERIC(10, 2) NOT NULL,
    prepared_at TIMESTAMPTZ NOT NULL,
    available_from TIMESTAMPTZ NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    storage_condition TEXT NOT NULL,
    packaging_type TEXT NOT NULL,
    is_sealed BOOLEAN NOT NULL DEFAULT TRUE,
    seal_id VARCHAR(50),
    pickup_address TEXT NOT NULL,
    pickup_coordinates GEOMETRY(Point, 4326) NOT NULL,
    image_url TEXT,
    status donation_status NOT NULL DEFAULT 'POSTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Enforce PRD Minimum Standard 5 kg rule directly in DB
    CONSTRAINT chk_min_donation_qty CHECK (quantity_kg >= 5.0),
    CONSTRAINT chk_remaining_positive CHECK (remaining_kg >= 0.0 AND remaining_kg <= quantity_kg)
);

CREATE TABLE ngo_needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ngo_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    meal_period meal_period NOT NULL,
    food_category food_category,
    dietary_requirement dietary_type NOT NULL DEFAULT 'ANY',
    required_quantity_kg NUMERIC(10, 2) NOT NULL,
    minimum_acceptable_kg NUMERIC(10, 2) NOT NULL DEFAULT 5.0,
    fulfilled_quantity_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    required_by TIMESTAMPTZ NOT NULL,
    receiving_address TEXT NOT NULL,
    receiving_coordinates GEOMETRY(Point, 4326) NOT NULL,
    available_capacity_kg NUMERIC(10, 2) NOT NULL,
    receiving_hours_start TIME NOT NULL DEFAULT '08:00',
    receiving_hours_end TIME NOT NULL DEFAULT '22:00',
    special_requirements TEXT,
    status need_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_need_quantities CHECK (required_quantity_kg > 0 AND fulfilled_quantity_kg >= 0)
);

-- --------------------------------------------------------------------
-- 5. RESERVATIONS & ALLOCATIONS (PRD Section 14, 15)
-- --------------------------------------------------------------------
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id),
    need_id UUID NOT NULL REFERENCES ngo_needs(id),
    reserved_quantity_kg NUMERIC(10, 2) NOT NULL,
    status reservation_status NOT NULL DEFAULT 'HELD',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id),
    need_id UUID NOT NULL REFERENCES ngo_needs(id),
    allocated_quantity_kg NUMERIC(10, 2) NOT NULL,
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. DELIVERY & TRUST CHAIN (PRD Section 16, 21, 22, 23)
-- --------------------------------------------------------------------
CREATE TABLE delivery_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id),
    donor_id UUID NOT NULL REFERENCES profiles(id),
    driver_id UUID REFERENCES profiles(id),
    required_vehicle_class vehicle_class NOT NULL,
    total_quantity_kg NUMERIC(10, 2) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_coordinates GEOMETRY(Point, 4326) NOT NULL,
    pickup_seal_id VARCHAR(50),
    pickup_otp_hash CHAR(64) NOT NULL, -- SHA-256 hashed
    base_fare NUMERIC(10, 2) NOT NULL,
    delivery_fare NUMERIC(10, 2) NOT NULL,
    platform_fee_12_percent NUMERIC(10, 2) NOT NULL,
    ngo_total NUMERIC(10, 2) NOT NULL,
    driver_payout NUMERIC(10, 2) NOT NULL,
    status job_status NOT NULL DEFAULT 'AVAILABLE',
    pickup_evidence_url TEXT,
    delivery_evidence_url TEXT,
    integrity_verdict integrity_verdict,
    integrity_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE delivery_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES delivery_jobs(id) ON DELETE CASCADE,
    stop_number INT NOT NULL,
    need_id UUID NOT NULL REFERENCES ngo_needs(id),
    ngo_id UUID NOT NULL REFERENCES profiles(id),
    quantity_kg NUMERIC(10, 2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_coordinates GEOMETRY(Point, 4326) NOT NULL,
    delivery_otp_hash CHAR(64) NOT NULL,
    arrived_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

-- --------------------------------------------------------------------
-- 7. FINANCE & WALLET LEDGER (PRD Section 25)
-- --------------------------------------------------------------------
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) UNIQUE,
    available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    reserved_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Append-only ledger
CREATE TABLE wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    entry_type ledger_entry_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    reference_job_id UUID REFERENCES delivery_jobs(id),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 8. IMPACT & CERTIFICATES (PRD Section 27, 28)
-- --------------------------------------------------------------------
CREATE TABLE impact_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES delivery_jobs(id),
    donation_id UUID NOT NULL REFERENCES donations(id),
    donor_id UUID NOT NULL REFERENCES profiles(id),
    ngo_id UUID NOT NULL REFERENCES profiles(id),
    driver_id UUID NOT NULL REFERENCES profiles(id),
    quantity_kg NUMERIC(10, 2) NOT NULL,
    meals_supported INT NOT NULL,
    co2e_prevented_kg NUMERIC(10, 2) NOT NULL,
    water_conserved_liters NUMERIC(10, 2) NOT NULL,
    methane_diverted_kg NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 9. AUDIT & SUPPORT (PRD Section 40)
-- --------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial Indexes for PostGIS Proximity Queries
CREATE INDEX idx_donations_coords ON donations USING GIST (pickup_coordinates);
CREATE INDEX idx_needs_coords ON ngo_needs USING GIST (receiving_coordinates);
CREATE INDEX idx_drivers_coords ON driver_details USING GIST (current_coordinates);
