// Types for credit_simulations table in Supabase
export interface CreditSimulation {
  id: string;
  user_id: string | null;
  car_id: string | null;
  credit_parameter_id: string | null;
  financial_partner_id: string | null;
  otr_price: number;
  down_payment: number;
  down_payment_percentage: number;
  loan_amount: number;
  tenor_months: number;
  interest_rate_yearly: number;
  interest_type: string;
  monthly_installment: number;
  total_interest: number;
  admin_fee: number;
  provision_fee: number;
  fidusia_fee: number;
  life_insurance: number;
  vehicle_insurance_type: string;
  vehicle_insurance_yearly: number;
  vehicle_insurance_total: number;
  total_initial_payment: number;
  total_payment: number;
  simulation_data: any | null;
  is_saved: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Type for creating credit simulations
export interface CreditSimulationPayload {
  user_id?: string | null;
  car_id?: string | null;
  credit_parameter_id: string | null;
  financial_partner_id: string | null;
  otr_price: number;
  down_payment: number;
  down_payment_percentage: number;
  loan_amount: number;
  tenor_months: number;
  interest_rate_yearly: number;
  interest_type: string;
  monthly_installment: number;
  total_interest: number;
  admin_fee: number;
  provision_fee: number;
  fidusia_fee: number;
  life_insurance: number;
  vehicle_insurance_type: string;
  vehicle_insurance_yearly: number;
  vehicle_insurance_total: number;
  total_initial_payment: number;
  total_payment: number;
  simulation_data?: any | null;
  is_saved?: boolean;
  notes?: string | null;
}

// Extended type with related data for UI display
export interface CreditSimulationWithDetails extends CreditSimulation {
  credit_parameter?: {
    name: string;
    financial_partners?: {
      name: string;
    };
  };
  financial_partner?: {
    name: string;
  };
  car?: {
    brand: string;
    model: string;
    year: number;
    price: number;
  };
  user?: {
    email: string;
    full_name?: string;
  };
}

// Type for simulation form data
export interface SimulationFormData {
  otr_price: number;
  down_payment: number;
  down_payment_percentage: number;
  insurance_type: 'TLO' | 'Allrisk';
  location: string;
  notes?: string;
}