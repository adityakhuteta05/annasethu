-- ====================================================================
-- ANNASETU Migration: 0001_auth_profiles.sql
-- Role-based Authentication, Profiles, Detail Tables, Triggers & RLS
-- ====================================================================

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('DONOR', 'NGO', 'DRIVER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM (
        'REGISTERED',
        'DOCUMENTS_SUBMITTED',
        'GOVERNMENT_CHECK',
        'ADMIN_REVIEW',
        'VERIFIED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Audit Logs Table (For tracking authentication & registration events)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    role TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (actor_id = auth.uid());

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    verification_status verification_status NOT NULL DEFAULT 'REGISTERED',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_phone_indian_format CHECK (phone ~ '^[6-9]\d{9}$')
);

-- 4. Role Detail Tables
-- 4.1 Donor Details
CREATE TABLE IF NOT EXISTS public.donor_details (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    gstin TEXT NOT NULL,
    fssai_no TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_gstin_format CHECK (gstin ~ '^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$'),
    CONSTRAINT chk_fssai_format CHECK (fssai_no ~ '^\d{14}$')
);

-- 4.2 NGO Details
CREATE TABLE IF NOT EXISTS public.ngo_details (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    org_name TEXT NOT NULL,
    registration_no TEXT NOT NULL,
    darpan_id TEXT, -- Optional / Nullable
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Driver Details
CREATE TABLE IF NOT EXISTS public.driver_details (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    dl_no TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    rc_no TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Immutability Trigger for role & verification_status on client updates
-- Prevents users from updating their own role or verification_status directly via client updates
CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Prevent changing role
    IF NEW.role <> OLD.role THEN
        RAISE EXCEPTION 'Modifying user role is not permitted.';
    END IF;

    -- Prevent self-updating verification status unless by service_role (can be checked via current_setting or session)
    IF NEW.verification_status <> OLD.verification_status AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Modifying verification status is restricted to administrative authority.';
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_immutable_fields();

-- 6. Trigger on auth.users to create profiles + role detail tables + audit log
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_raw_role TEXT;
    v_role app_role;
    v_full_name TEXT;
    v_phone TEXT;
    v_meta JSONB;
BEGIN
    v_meta := NEW.raw_user_meta_data;
    v_raw_role := UPPER(COALESCE(v_meta->>'role', ''));

    -- Strict Whitelist: Only DONOR, NGO, DRIVER are permitted for self-registration.
    -- Reject or downgrade ADMIN.
    IF v_raw_role = 'ADMIN' THEN
        RAISE EXCEPTION 'Self-registration as ADMIN is strictly prohibited.';
    ELSIF v_raw_role = 'DONOR' THEN
        v_role := 'DONOR'::app_role;
    ELSIF v_raw_role IN ('NGO', 'RECEIVER') THEN
        v_role := 'NGO'::app_role;
    ELSIF v_raw_role IN ('DRIVER', 'DELIVERY_PARTNER') THEN
        v_role := 'DRIVER'::app_role;
    ELSE
        RAISE EXCEPTION 'Invalid registration role: %. Permitted roles: DONOR, NGO, DRIVER.', v_raw_role;
    END IF;

    v_full_name := COALESCE(v_meta->>'full_name', 'Participant');
    v_phone := COALESCE(v_meta->>'phone', '9999999999');

    -- Insert Profile
    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        phone,
        verification_status,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        v_role,
        v_full_name,
        v_phone,
        'REGISTERED'::verification_status,
        TRUE,
        NOW(),
        NOW()
    );

    -- Insert Role-Specific Details
    IF v_role = 'DONOR'::app_role THEN
        INSERT INTO public.donor_details (
            profile_id,
            business_name,
            gstin,
            fssai_no
        ) VALUES (
            NEW.id,
            COALESCE(v_meta->>'business_name', v_full_name),
            COALESCE(v_meta->>'gstin', '07AAAAA0000A1Z5'),
            COALESCE(v_meta->>'fssai_no', '10000000000000')
        );
    ELSIF v_role = 'NGO'::app_role THEN
        INSERT INTO public.ngo_details (
            profile_id,
            org_name,
            registration_no,
            darpan_id
        ) VALUES (
            NEW.id,
            COALESCE(v_meta->>'org_name', v_full_name),
            COALESCE(v_meta->>'registration_no', 'REG-PENDING'),
            v_meta->>'darpan_id'
        );
    ELSIF v_role = 'DRIVER'::app_role THEN
        INSERT INTO public.driver_details (
            profile_id,
            dl_no,
            vehicle_type,
            rc_no
        ) VALUES (
            NEW.id,
            COALESCE(v_meta->>'dl_no', 'DL-PENDING'),
            COALESCE(v_meta->>'vehicle_type', 'MOTORCYCLE'),
            COALESCE(v_meta->>'rc_no', 'RC-PENDING')
        );
    END IF;

    -- Write Audit Log Entry
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        role,
        details
    ) VALUES (
        NEW.id,
        'USER_REGISTRATION',
        v_role::text,
        jsonb_build_object(
            'email', NEW.email,
            'full_name', v_full_name,
            'role', v_role::text,
            'verification_status', 'REGISTERED'
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_registration();

-- 7. Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_details ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles RLS
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 7.2 Donor Details RLS
CREATE POLICY "Donors can view their own details"
    ON public.donor_details
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Donors can update their own details"
    ON public.donor_details
    FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- 7.3 NGO Details RLS
CREATE POLICY "NGOs can view their own details"
    ON public.ngo_details
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "NGOs can update their own details"
    ON public.ngo_details
    FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- 7.4 Driver Details RLS
CREATE POLICY "Drivers can view their own details"
    ON public.driver_details
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Drivers can update their own details"
    ON public.driver_details
    FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
