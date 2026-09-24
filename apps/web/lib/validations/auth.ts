import { z } from 'zod';

// Regular expression patterns matching database CHECK constraints
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
export const FSSAI_REGEX = /^\d{14}$/;
export const RC_REGEX = /^[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{0,3}[-\s]?\d{4}$|^[A-Z0-9\-\s]{6,15}$/;
export const DL_REGEX = /^[A-Z0-9\-\s]{8,20}$/;
export const DARPAN_REGEX = /^[A-Z]{2}\/\d{4}\/\d{7}$/;

// Base user credentials
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long');

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, 'Enter a valid 10-digit Indian phone number starting with 6-9');

export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters');

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Donor Registration Schema
export const donorRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: fullNameSchema,
  phone: phoneSchema,
  business_name: z.string().min(2, 'Legal business or kitchen name is required'),
  gstin: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => GSTIN_REGEX.test(v), {
      message: 'Invalid GSTIN format (e.g. 07AAAAA0000A1Z5)',
    }),
  fssai_no: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => FSSAI_REGEX.test(v), {
      message: 'FSSAI licence number must be exactly 14 digits',
    }),
});

export type DonorRegisterFormData = z.infer<typeof donorRegisterSchema>;

// NGO / Receiver Registration Schema
export const ngoRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: fullNameSchema,
  phone: phoneSchema,
  org_name: z.string().min(2, 'Organization or shelter name is required'),
  registration_no: z.string().min(2, 'Official NGO registration number is required'),
  darpan_id: z
    .string()
    .optional()
    .refine((val) => !val || DARPAN_REGEX.test(val.trim().toUpperCase()) || val.trim().length >= 6, {
      message: 'Invalid NGO-DARPAN format (e.g. DL/2021/0291456)',
    }),
});

export type NgoRegisterFormData = z.infer<typeof ngoRegisterSchema>;

// Delivery Partner Registration Schema
export const driverRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: fullNameSchema,
  phone: phoneSchema,
  dl_no: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => DL_REGEX.test(v), {
      message: 'Enter a valid commercial Driving Licence number',
    }),
  vehicle_type: z.enum(['MOTORCYCLE', 'SCOOTER', 'SMALL_VAN', 'VAN', 'MINI_TRUCK', 'TRUCK'], {
    errorMap: () => ({ message: 'Select a valid vehicle class' }),
  }),
  rc_no: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => v.length >= 6, {
      message: 'Enter a valid vehicle Registration Certificate (RC) number',
    }),
});

export type DriverRegisterFormData = z.infer<typeof driverRegisterSchema>;

// Map Supabase errors to friendly human-readable messages
export function mapSupabaseAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (message.includes('password should be at least')) {
    return 'Password is too weak. Please choose at least 8 characters.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. For security reasons, please wait a minute before trying again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please verify your email address to sign in.';
  }
  if (message.includes('database error saving new user')) {
    return 'Database trigger error: Please execute migration 0002 in your Supabase SQL Editor to grant trigger permissions.';
  }

  return error.message || 'Authentication failed. Please try again.';
}
