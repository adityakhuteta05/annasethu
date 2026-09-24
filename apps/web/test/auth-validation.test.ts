import { describe, it, expect } from 'vitest';
import {
  PHONE_REGEX,
  GSTIN_REGEX,
  FSSAI_REGEX,
  phoneSchema,
  donorRegisterSchema,
  ngoRegisterSchema,
  driverRegisterSchema,
  resetPasswordSchema,
  mapSupabaseAuthError,
} from '../lib/validations/auth';

describe('AnnaSetu Auth Validation Unit Tests', () => {
  describe('Indian Phone Number Validation', () => {
    it('accepts valid 10-digit mobile numbers starting with 6, 7, 8, 9', () => {
      const validNumbers = [
        '9810123456',
        '8765432109',
        '7011223344',
        '6299887766',
      ];
      validNumbers.forEach((phone) => {
        expect(PHONE_REGEX.test(phone)).toBe(true);
        expect(phoneSchema.safeParse(phone).success).toBe(true);
      });
    });

    it('rejects invalid mobile numbers (starts with 0-5, wrong length, non-numeric)', () => {
      const invalidNumbers = [
        '5810123456', // Starts with 5
        '0981012345', // Starts with 0
        '981012345',  // 9 digits
        '98101234567', // 11 digits
        '98101ABCDE', // Non-numeric
        '+919810123456', // Must be raw 10 digits
      ];
      invalidNumbers.forEach((phone) => {
        expect(PHONE_REGEX.test(phone)).toBe(false);
        expect(phoneSchema.safeParse(phone).success).toBe(false);
      });
    });
  });

  describe('GSTIN Validation (^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$)', () => {
    it('accepts valid 15-character Indian GSTINs', () => {
      const validGstins = [
        '07AAAAA0000A1Z5',
        '27ABCDE1234F1Z5',
        '29AABCS1429B1ZB',
        '06BZTPR4412M1Z2',
      ];
      validGstins.forEach((gstin) => {
        expect(GSTIN_REGEX.test(gstin)).toBe(true);
      });
    });

    it('rejects invalid GSTINs', () => {
      const invalidGstins = [
        '07AAAAA0000A1Z',    // 14 chars (too short)
        '07AAAAA0000A1Z55',  // 16 chars (too long)
        'XXAAAAA0000A1Z5',   // Starts with letters instead of state code digits
        '07111110000A1Z5',   // Digits where letters should be in PAN
        '07AAAAA0000A1A5',   // Missing 14th character 'Z'
      ];
      invalidGstins.forEach((gstin) => {
        expect(GSTIN_REGEX.test(gstin)).toBe(false);
      });
    });
  });

  describe('FSSAI Licence Validation (^\d{14}$)', () => {
    it('accepts valid exactly 14-digit FSSAI numbers', () => {
      const validFssai = [
        '10019011005891',
        '20021011001234',
        '10000000000000',
        '99999999999999',
      ];
      validFssai.forEach((no) => {
        expect(FSSAI_REGEX.test(no)).toBe(true);
      });
    });

    it('rejects invalid FSSAI licence numbers', () => {
      const invalidFssai = [
        '1001901100589',   // 13 digits (too short)
        '100190110058912', // 15 digits (too long)
        '1001901100589A',  // Contains letters
        'FSSAI-10019011',  // Non-numeric prefix
      ];
      invalidFssai.forEach((no) => {
        expect(FSSAI_REGEX.test(no)).toBe(false);
      });
    });
  });

  describe('Role-Specific Registration Schemas', () => {
    it('validates a complete and correct Donor registration payload', () => {
      const validDonor = {
        email: 'chef@grandpalace.in',
        password: 'SecurePassword123!',
        full_name: 'Vikram Malhotra',
        phone: '9810011223',
        business_name: 'Grand Palace Banquet & Catering',
        gstin: '07AAAAA0000A1Z5',
        fssai_no: '10019011005891',
      };
      const result = donorRegisterSchema.safeParse(validDonor);
      expect(result.success).toBe(true);
    });

    it('rejects Donor registration with invalid GSTIN or weak password', () => {
      const invalidDonor = {
        email: 'chef@grandpalace.in',
        password: 'short', // < 8 characters
        full_name: 'Vikram Malhotra',
        phone: '9810011223',
        business_name: 'Grand Palace',
        gstin: 'INVALID_GSTIN',
        fssai_no: '10019011005891',
      };
      const result = donorRegisterSchema.safeParse(invalidDonor);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0]);
        expect(fields).toContain('password');
        expect(fields).toContain('gstin');
      }
    });

    it('validates a complete and correct NGO registration payload', () => {
      const validNgo = {
        email: 'relief@feedingdelhi.org',
        password: 'StrongNgoPass456!',
        full_name: 'Sunita Rao',
        phone: '8800112233',
        org_name: 'Feeding Delhi Relief Society',
        registration_no: 'REG-DL-2018-9941',
        darpan_id: 'DL/2021/0291456',
      };
      const result = ngoRegisterSchema.safeParse(validNgo);
      expect(result.success).toBe(true);
    });

    it('validates a complete and correct Driver registration payload', () => {
      const validDriver = {
        email: 'driver.karan@logistics.in',
        password: 'DriverPass789!',
        full_name: 'Karan Singh',
        phone: '7011223344',
        dl_no: 'DL-0420110099881',
        vehicle_type: 'MINI_TRUCK',
        rc_no: 'DL-1VB-8921',
      };
      const result = driverRegisterSchema.safeParse(validDriver);
      expect(result.success).toBe(true);
    });
  });

  describe('Password Reset Schema', () => {
    it('accepts matching passwords of sufficient length', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewStrongPassword123',
        confirmPassword: 'NewStrongPassword123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewStrongPassword123',
        confirmPassword: 'DifferentPassword456',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match');
      }
    });
  });

  describe('Supabase Error Mapping', () => {
    it('maps known auth errors to friendly user-facing messages', () => {
      expect(mapSupabaseAuthError({ message: 'Invalid login credentials' }))
        .toBe('Invalid email or password. Please verify your credentials.');
      expect(mapSupabaseAuthError({ message: 'User already registered' }))
        .toBe('An account with this email address already exists. Please sign in instead.');
      expect(mapSupabaseAuthError({ message: 'Too many requests' }))
        .toBe('Too many attempts. For security reasons, please wait a minute before trying again.');
    });
  });
});
