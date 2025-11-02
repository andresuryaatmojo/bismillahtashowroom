import { supabase } from '../lib/supabase';
import {
  CreditParameter,
  CreditParameterPayload,
  CreditParameterWithPartner,
  FinancialPartner
} from '../types/credit-parameters';

// Fetch all credit parameters with partner names
export const fetchCreditParameters = async (): Promise<CreditParameterWithPartner[]> => {
  try {
    const { data, error } = await supabase
      .from('credit_parameters')
      .select(`
        *,
        financial_partners (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      ...item,
      financial_partner_name: item.financial_partners?.name || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching credit parameters:', error);
    throw error;
  }
};

// Fetch credit parameters by partner ID
export const fetchCreditParametersByPartner = async (partnerId: string): Promise<CreditParameter[]> => {
  try {
    const { data, error } = await supabase
      .from('credit_parameters')
      .select('*')
      .eq('financial_partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching credit parameters by partner:', error);
    throw error;
  }
};

// Fetch credit parameter by ID
export const fetchCreditParameterById = async (id: string): Promise<CreditParameter | null> => {
  try {
    const { data, error } = await supabase
      .from('credit_parameters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching credit parameter:', error);
    throw error;
  }
};

// Create new credit parameter
export const createCreditParameter = async (payload: CreditParameterPayload): Promise<CreditParameter> => {
  try {
    const { data, error } = await supabase
      .from('credit_parameters')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating credit parameter:', error);
    throw error;
  }
};

// Update credit parameter
export const updateCreditParameter = async (id: string, payload: Partial<CreditParameterPayload>): Promise<CreditParameter> => {
  try {
    const { data, error } = await supabase
      .from('credit_parameters')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating credit parameter:', error);
    throw error;
  }
};

// Delete credit parameter
export const deleteCreditParameter = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('credit_parameters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting credit parameter:', error);
    throw error;
  }
};

// Toggle active status of credit parameter
export const toggleCreditParameterStatus = async (id: string, isActive: boolean): Promise<CreditParameter> => {
  try {
    const { data, error } = await supabase
      .from('credit_parameters')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling credit parameter status:', error);
    throw error;
  }
};

// Fetch financial partners (for dropdown)
export const fetchFinancialPartners = async (): Promise<FinancialPartner[]> => {
  try {
    const { data, error } = await supabase
      .from('financial_partners')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching financial partners:', error);
    throw error;
  }
};

// Search credit parameters with filters
export const searchCreditParameters = async (filters: {
  search?: string;
  partnerId?: string;
  isActive?: boolean;
}): Promise<CreditParameterWithPartner[]> => {
  try {
    let query = supabase
      .from('credit_parameters')
      .select(`
        *,
        financial_partners (
          id,
          name
        )
      `);

    // Apply search filter
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Apply partner filter
    if (filters.partnerId) {
      query = query.eq('financial_partner_id', filters.partnerId);
    }

    // Apply active filter
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      ...item,
      financial_partner_name: item.financial_partners?.name || 'Unknown'
    }));
  } catch (error) {
    console.error('Error searching credit parameters:', error);
    throw error;
  }
};

// Check if parameter name is unique within a partner
export const checkParameterNameUnique = async (
  name: string,
  partnerId: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('credit_parameters')
      .select('id')
      .eq('name', name)
      .eq('financial_partner_id', partnerId);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return !data || data.length === 0;
  } catch (error) {
    console.error('Error checking parameter name uniqueness:', error);
    throw error;
  }
};