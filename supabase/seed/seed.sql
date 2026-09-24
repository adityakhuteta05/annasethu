-- ====================================================================
-- ANNASETU Initial Database Seed (supabase/seed/seed.sql)
-- Provides baseline demo users, profiles, and initial ledger state.
-- ====================================================================

-- 1. Create Demo Users in auth.users (if using local Supabase CLI or seed scripts)
-- Note: In production Supabase, users are created via Supabase Auth or admin CLI.

-- 2. Insert Profiles & Role Details for Baseline Participants
-- 2.1 Demo Food Donor: The Oberoi Grand Kitchen
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
    '00000000-0000-0000-0000-000000000001',
    'DONOR',
    'Chef Vikram Singhania (The Oberoi)',
    '9810011223',
    'VERIFIED',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.donor_details (
    profile_id,
    business_name,
    gstin,
    fssai_no,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'The Oberoi Grand Banquet & Kitchens',
    '07AAAAA0000A1Z5',
    '10019011005891',
    NOW(),
    NOW()
) ON CONFLICT (profile_id) DO NOTHING;

-- 2.2 Demo NGO / Receiver: Roti Bank Relief Trust
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
    '00000000-0000-0000-0000-000000000002',
    'NGO',
    'Ananya Deshmukh (Roti Bank)',
    '8800112233',
    'VERIFIED',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ngo_details (
    profile_id,
    org_name,
    registration_no,
    darpan_id,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Roti Bank Delhi Relief Society',
    'REG-DL-2019-4412',
    'DL/2021/0291456',
    NOW(),
    NOW()
) ON CONFLICT (profile_id) DO NOTHING;

-- 2.3 Demo Delivery Partner: Harpreet Singh (Mini Truck)
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
    '00000000-0000-0000-0000-000000000003',
    'DRIVER',
    'Harpreet Singh',
    '7011223344',
    'VERIFIED',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.driver_details (
    profile_id,
    dl_no,
    vehicle_type,
    rc_no,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'DL-0420110099881',
    'MINI_TRUCK',
    'DL-1VB-8921',
    NOW(),
    NOW()
) ON CONFLICT (profile_id) DO NOTHING;

-- 2.4 Demo Admin: Operations Command Center
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
    '00000000-0000-0000-0000-000000000000',
    'ADMIN',
    'AnnaSetu Operations Command',
    '9810099999',
    'VERIFIED',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
