// Types for credit_parameters table in Supabase
export interface CreditParameter {
  id: string;
  financial_partner_id: string | null;
  name: string;
  min_dp_percentage: number;
  max_dp_percentage: number;
  tenor_months: number;
  interest_rate_yearly: number;
  interest_type: 'flat' | 'efektif' | 'anuitas';
  admin_fee: number;
  provision_fee_percentage: number;
  fidusia_fee: number;
  insurance_tlo_percentage: number;
  insurance_allrisk_percentage: number;
  life_insurance_percentage: number;
  min_otr: number | null;
  max_otr: number | null;
  is_active: boolean;
  effective_date: string;
  expired_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Extended type with financial partner name for UI display
export interface CreditParameterWithPartner extends CreditParameter {
  financial_partner_name?: string;
}

// Type for creating/updating credit parameters
export interface CreditParameterFormData {
  financial_partner_id: string;
  name: string;
  min_dp_percentage: string;
  max_dp_percentage: string;
  tenor_months: string;
  interest_rate_yearly: string;
  interest_type: 'flat' | 'efektif' | 'anuitas';
  admin_fee: string;
  provision_fee_percentage: string;
  fidusia_fee: string;
  insurance_tlo_percentage: string;
  insurance_allrisk_percentage: string;
  life_insurance_percentage: string;
  min_otr: string;
  max_otr: string;
  is_active: boolean;
  effective_date: string;
  expired_date: string;
  notes: string;
}

// Type for API payload
export interface CreditParameterPayload {
  financial_partner_id: string | null;
  name: string;
  min_dp_percentage: number;
  max_dp_percentage: number;
  tenor_months: number;
  interest_rate_yearly: number;
  interest_type: 'flat' | 'efektif' | 'anuitas';
  admin_fee: number;
  provision_fee_percentage: number;
  fidusia_fee: number;
  insurance_tlo_percentage: number;
  insurance_allrisk_percentage: number;
  life_insurance_percentage: number;
  min_otr: number | null;
  max_otr: number | null;
  is_active: boolean;
  effective_date: string;
  expired_date: string | null;
  notes: string | null;
}

// Financial Partner type
export interface FinancialPartner {
  id: string;
  name: string;
  code: string;
  is_active?: boolean;
}