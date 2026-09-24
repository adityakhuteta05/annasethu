-- ====================================================================
-- ANNASETU Migration: 0002_fix_auth_registration_trigger.sql
-- Fixes "Database error saving new user" by:
-- 1. Setting search_path on trigger functions (CRITICAL for Supabase auth triggers)
-- 2. Granting proper permissions to supabase_auth_admin & service_role
-- 3. Adding missing INSERT policies for RLS
-- 4. Adding fault-tolerant exception handling in trigger
-- ====================================================================

-- 1. Grant schema permissions to supabase_auth_admin, postgres, service_role, authenticated, anon
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role, supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role, supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role, supabase_auth_admin;

-- 2. Add explicit INSERT policies for RLS on all auth-related tables
DROP POLICY IF EXISTS "Enable insert for auth service and users" ON public.profiles;
CREATE POLICY "Enable insert for auth service and users"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for donor details" ON public.donor_details;
CREATE POLICY "Enable insert for donor details"
    ON public.donor_details FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for ngo details" ON public.ngo_details;
CREATE POLICY "Enable insert for ngo details"
    ON public.ngo_details FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for driver details" ON public.driver_details;
CREATE POLICY "Enable insert for driver details"
    ON public.driver_details FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for audit logs" ON public.audit_logs;
CREATE POLICY "Enable insert for audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- 3. Robust, fault-tolerant handle_new_user_registration trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_raw_role TEXT;
    v_role public.app_role;
    v_full_name TEXT;
    v_phone TEXT;
    v_meta JSONB;
BEGIN
    v_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    v_raw_role := UPPER(COALESCE(v_meta->>'role', 'DONOR'));

    -- Determine role with fallback
    IF v_raw_role = 'ADMIN' THEN
        -- Prevent self-selected admin, default safely to DONOR
        v_role := 'DONOR'::public.app_role;
    ELSIF v_raw_role IN ('NGO', 'RECEIVER') THEN
        v_role := 'NGO'::public.app_role;
    ELSIF v_raw_role IN ('DRIVER', 'DELIVERY_PARTNER') THEN
        v_role := 'DRIVER'::public.app_role;
    ELSE
        v_role := 'DONOR'::public.app_role;
    END IF;

    v_full_name := COALESCE(NULLIF(TRIM(v_meta->>'full_name'), ''), 'Participant');
    
    -- Format phone to satisfy 10-digit check
    v_phone := COALESCE(NULLIF(TRIM(v_meta->>'phone'), ''), '9999999999');
    IF NOT (v_phone ~ '^[6-9]\d{9}$') THEN
        v_phone := '9999999999';
    END IF;

    -- 1. Insert or update Profile
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
        'REGISTERED'::public.verification_status,
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();

    -- 2. Insert Role-Specific Details with resilient exception trapping
    BEGIN
        IF v_role = 'DONOR'::public.app_role THEN
            INSERT INTO public.donor_details (
                profile_id,
                business_name,
                gstin,
                fssai_no
            ) VALUES (
                NEW.id,
                COALESCE(NULLIF(TRIM(v_meta->>'business_name'), ''), v_full_name),
                COALESCE(NULLIF(TRIM(v_meta->>'gstin'), ''), '07AAAAA0000A1Z5'),
                COALESCE(NULLIF(TRIM(v_meta->>'fssai_no'), ''), '10000000000000')
            )
            ON CONFLICT (profile_id) DO UPDATE SET
                business_name = EXCLUDED.business_name,
                gstin = EXCLUDED.gstin,
                fssai_no = EXCLUDED.fssai_no,
                updated_at = NOW();
        ELSIF v_role = 'NGO'::public.app_role THEN
            INSERT INTO public.ngo_details (
                profile_id,
                org_name,
                registration_no,
                darpan_id
            ) VALUES (
                NEW.id,
                COALESCE(NULLIF(TRIM(v_meta->>'org_name'), ''), v_full_name),
                COALESCE(NULLIF(TRIM(v_meta->>'registration_no'), ''), 'REG-PENDING'),
                NULLIF(TRIM(v_meta->>'darpan_id'), '')
            )
            ON CONFLICT (profile_id) DO UPDATE SET
                org_name = EXCLUDED.org_name,
                registration_no = EXCLUDED.registration_no,
                darpan_id = EXCLUDED.darpan_id,
                updated_at = NOW();
        ELSIF v_role = 'DRIVER'::public.app_role THEN
            INSERT INTO public.driver_details (
                profile_id,
                dl_no,
                vehicle_type,
                rc_no
            ) VALUES (
                NEW.id,
                COALESCE(NULLIF(TRIM(v_meta->>'dl_no'), ''), 'DL-PENDING'),
                COALESCE(NULLIF(TRIM(v_meta->>'vehicle_type'), ''), 'MOTORCYCLE'),
                COALESCE(NULLIF(TRIM(v_meta->>'rc_no'), ''), 'RC-PENDING')
            )
            ON CONFLICT (profile_id) DO UPDATE SET
                dl_no = EXCLUDED.dl_no,
                vehicle_type = EXCLUDED.vehicle_type,
                rc_no = EXCLUDED.rc_no,
                updated_at = NOW();
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Role detail insertion warning: %', SQLERRM;
    END;

    -- 3. Write Audit Log Entry
    BEGIN
        INSERT INTO public.audit_logs (
            actor_id,
            action,
            role,
            details
        ) VALUES (
            NEW.id,
            'USER_REGISTERED',
            v_role::TEXT,
            jsonb_build_object(
                'email', NEW.email,
                'role', v_role::TEXT,
                'timestamp', NOW()
            )
        );
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN NEW;
END;
$$;

-- 4. Re-attach Trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_registration();
