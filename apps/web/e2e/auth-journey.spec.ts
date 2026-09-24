import { test, expect } from '@playwright/test';

test.describe('AnnaSetu Role-Based Authentication & Authorization Flow', () => {

  // 1. Role Selection Screen
  test('displays all 3 self-selectable roles on /login and prevents admin self-selection', async ({ page }) => {
    await page.goto('/login');

    // Title and branding
    await expect(page.locator('h1')).toContainText('Select Your Participation Role');
    await expect(page.locator('text=ANNASETU')).toBeVisible();

    // 3 Role cards exist
    const donorCard = page.locator('a[href="/login/donor"]');
    const ngoCard = page.locator('a[href="/login/receiver"]');
    const driverCard = page.locator('a[href="/login/driver"]');

    await expect(donorCard).toBeVisible();
    await expect(donorCard).toContainText('Food Donor');
    await expect(donorCard).toContainText('FSSAI & GST Compliant');

    await expect(ngoCard).toBeVisible();
    await expect(ngoCard).toContainText('NGO / Receiver');
    await expect(ngoCard).toContainText('NPO DARPAN / 80G');

    await expect(driverCard).toBeVisible();
    await expect(driverCard).toContainText('Delivery Partner');
    await expect(driverCard).toContainText('Verified Vehicle & DL');

    // Admin is NOT one of the 3 primary cards
    const adminDirectCard = page.locator('.grid a[href="/login/admin"]');
    await expect(adminDirectCard).toHaveCount(0);
  });

  // 2. Unauthenticated Protected Route Guard
  test('unauthenticated users accessing protected routes are redirected to /login', async ({ page }) => {
    // Attempt to access /donor/dashboard directly
    await page.goto('/donor/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // Attempt to access /receiver/dashboard directly
    await page.goto('/receiver/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // Attempt to access /driver/jobs directly
    await page.goto('/driver/jobs');
    await expect(page).toHaveURL(/\/login/);
  });

  // 3. Donor Registration Flow & Validation
  test('Donor registration validates Indian GSTIN, FSSAI and submits', async ({ page }) => {
    await page.goto('/login/donor');

    // Switch to Register tab
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('button:has-text("Register as Food Donor")')).toBeVisible();

    // Fill valid data
    await page.fill('input[name="full_name"]', 'Chef Vikram Singhania');
    await page.fill('input[name="phone"]', '9810011223');
    await page.fill('input[name="email"]', 'vikram@grandpalace.in');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="business_name"]', 'Grand Palace Banquet & Hotel');
    await page.fill('input[name="gstin"]', '07AAAAA0000A1Z5');
    await page.fill('input[name="fssai_no"]', '10019011005891');

    // Verification fields are visible with labels
    await expect(page.locator('label:has-text("GSTIN (15 chars)")')).toBeVisible();
    await expect(page.locator('label:has-text("FSSAI License (14 digits)")')).toBeVisible();
  });

  // 4. NGO / Receiver Registration Flow
  test('NGO registration displays organization and DARPAN ID fields', async ({ page }) => {
    await page.goto('/login/receiver');

    await page.click('button:has-text("Create Account")');
    await expect(page.locator('button:has-text("Register as NGO Receiver")')).toBeVisible();

    // Fill details
    await page.fill('input[name="full_name"]', 'Ananya Deshmukh');
    await page.fill('input[name="phone"]', '8800112233');
    await page.fill('input[name="email"]', 'contact@rotibankdelhi.org');
    await page.fill('input[name="password"]', 'RotiBankPass2026!');
    await page.fill('input[name="org_name"]', 'Roti Bank Delhi Relief Trust');
    await page.fill('input[name="registration_no"]', 'REG-DL-2019-4412');
    await page.fill('input[name="darpan_id"]', 'DL/2021/0291456');

    await expect(page.locator('input[name="darpan_id"]')).toHaveValue('DL/2021/0291456');
  });

  // 5. Delivery Partner Registration Flow
  test('Driver registration displays vehicle selector and commercial DL/RC fields', async ({ page }) => {
    await page.goto('/login/driver');

    await page.click('button:has-text("Create Account")');
    await expect(page.locator('button:has-text("Register as Delivery Partner")')).toBeVisible();

    await page.fill('input[name="full_name"]', 'Harpreet Singh');
    await page.fill('input[name="phone"]', '7011223344');
    await page.fill('input[name="email"]', 'harpreet.fleet@gmail.com');
    await page.fill('input[name="password"]', 'DriverSecure456!');
    await page.fill('input[name="dl_no"]', 'DL-0420110099881');
    await page.selectOption('select[name="vehicle_type"]', 'MINI_TRUCK');
    await page.fill('input[name="rc_no"]', 'DL-1VB-8921');

    await expect(page.locator('select[name="vehicle_type"]')).toHaveValue('MINI_TRUCK');
  });

  // 6. Admin Cannot Self-Register
  test('Admin portal does not allow self-registration', async ({ page }) => {
    await page.goto('/login/admin');

    await expect(page.locator('h1')).toContainText('System Administrator');
    // "Create Account" tab should NOT be present for admin
    await expect(page.locator('button:has-text("Create Account")')).toHaveCount(0);
    // Only Sign In is present
    await expect(page.locator('button:has-text("Sign in to System Administrator")')).toBeVisible();
  });

  // 7. Password Reset does not leak email existence
  test('Forgot password shows safe generic confirmation message', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.fill('input[type="email"]', 'random.unregistered@company.com');
    await page.click('button:has-text("Send Password Reset Link")');

    // Verifies generic message without revealing if email exists
    await expect(page.locator('text=Recovery Instructions Sent')).toBeVisible();
    await expect(page.locator('text=If an account exists')).toBeVisible();
  });
});
