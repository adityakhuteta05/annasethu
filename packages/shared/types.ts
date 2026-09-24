/**
 * ANNASETU Shared TypeScript Contracts & Domain Models
 * Synchronized across Next.js App Router (apps/web) and FastAPI backend (apps/api).
 */

export type UserRole = 'DONOR' | 'NGO' | 'DRIVER' | 'ADMIN';

export type VerificationStatus =
  | 'REGISTERED'
  | 'DOCUMENTS_SUBMITTED'
  | 'GOVERNMENT_CHECK'
  | 'ADMIN_REVIEW'
  | 'VERIFIED'
  | 'REJECTED';

export type FoodCategory =
  | 'GRAINS_RICE'
  | 'CURRIES_GRAVIES'
  | 'BREADS_ROTI'
  | 'DAIRY_SWEETS'
  | 'SNACKS_SAVORIES'
  | 'FRESH_PRODUCE'
  | 'PACKAGED_MEALS'
  | 'BEVERAGES'
  | 'OTHER';

export type DietaryType = 'VEG' | 'NON_VEG' | 'ANY';

export type MealPeriod = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'OTHER';

export type NeedStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'EXPIRED'
  | 'CANCELLED';

export type DonationStatus =
  | 'DRAFT'
  | 'POSTED'
  | 'MATCHED'
  | 'ALLOCATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'UNMATCHED'
  | 'EXPIRED'
  | 'CANCELLED';

export type VehicleClass =
  | 'MOTORCYCLE'
  | 'SCOOTER'
  | 'SMALL_VAN'
  | 'VAN'
  | 'MINI_TRUCK'
  | 'TRUCK';

export type JobStatus =
  | 'AVAILABLE'
  | 'ACCEPTED'
  | 'ARRIVING_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'AT_STOP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED_PICKUP'
  | 'FAILED_DELIVERY'
  | 'REASSIGNMENT_REQUIRED';

export type IntegrityVerdict =
  | 'NO_VISIBLE_DISCREPANCY'
  | 'POSSIBLE_PACKAGE_DISCREPANCY'
  | 'AI_UNAVAILABLE_MANUAL_REVIEW';

export type ServiceStatus = 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE' | 'DISABLED';

export type SecretClassification = 'PUBLIC' | 'PRIVATE' | 'HIGHLY_SENSITIVE';

export interface ServiceHealthSnapshot {
  name: string;
  status: ServiceStatus;
  latency_ms: number;
  failure_count: number;
  fallback_mode: string;
  last_check: string;
  details: string;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  contact_phone?: string;
  contact_person?: string;
}

export interface ScoreBreakdown {
  score: number;
  expiry_urgency: number;
  eta_efficiency: number;
  distance_efficiency: number;
  need_fulfillment: number;
  route_efficiency: number;
  reasons: string[];
}

export interface MatchProposal {
  donation_id: string;
  need_id: string;
  ngo_id: string;
  ngo_name: string;
  donor_id: string;
  donor_name: string;
  eligible: boolean;
  rejection_reasons: string[];
  score?: number;
  breakdown?: ScoreBreakdown;
  distance_km: number;
  estimated_eta_minutes: number;
  allocatable_quantity_kg: number;
}

export interface FareQuote {
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  stops_fare: number;
  delivery_fare: number;
  platform_fee_12_percent: number;
  ngo_total: number;
  driver_payout: number;
  distance_km: number;
  duration_minutes: number;
}

export interface DeliveryStop {
  stop_number: number;
  need_id: string;
  ngo_id: string;
  ngo_name: string;
  location: Location;
  quantity_kg: number;
  status: string;
  arrived_at?: string;
  delivered_at?: string;
}

export interface DeliveryJob {
  id: string;
  donation_id: string;
  donor_id: string;
  donor_name: string;
  pickup_location: Location;
  pickup_seal_id?: string;
  required_vehicle_class: VehicleClass;
  total_quantity_kg: number;
  stops: DeliveryStop[];
  fare_quote: FareQuote;
  driver_id?: string;
  driver_name?: string;
  status: JobStatus;
  pickup_evidence_url?: string;
  delivery_evidence_url?: string;
  integrity_verdict?: IntegrityVerdict;
  integrity_reason?: string;
  created_at: string;
}

export interface FoodDonation {
  id: string;
  donor_id: string;
  donor_name: string;
  title: string;
  food_category: FoodCategory;
  dietary_type: DietaryType;
  quantity_kg: number;
  remaining_kg: number;
  prepared_at: string;
  available_from: string;
  deadline: string;
  storage_condition: string;
  packaging_type: string;
  is_sealed: boolean;
  seal_id?: string;
  pickup_location: Location;
  image_url?: string;
  status: DonationStatus;
  created_at: string;
}

export interface NGONeed {
  id: string;
  ngo_id: string;
  ngo_name: string;
  title: string;
  meal_period: MealPeriod;
  food_category?: FoodCategory;
  dietary_requirement: DietaryType;
  required_quantity_kg: number;
  minimum_acceptable_kg: number;
  fulfilled_quantity_kg: number;
  required_by: string;
  receiving_location: Location;
  available_capacity_kg: number;
  receiving_hours_start: string;
  receiving_hours_end: string;
  status: NeedStatus;
  created_at: string;
}

export interface ImpactRecord {
  id: string;
  job_id: string;
  donation_id: string;
  donor_name: string;
  ngo_name: string;
  driver_name: string;
  food_category: string;
  quantity_kg: number;
  meals_supported_estimate: number;
  co2e_prevented_kg_estimate: number;
  water_conserved_liters_estimate: number;
  timestamp: string;
  disclaimer: string;
}

export interface ImpactSummary {
  total_rescued_kg: number;
  total_meals_supported: number;
  total_co2e_prevented_kg: number;
  total_water_conserved_liters: number;
  total_rescues_completed: number;
  active_donors_count: number;
  active_ngos_count: number;
}
