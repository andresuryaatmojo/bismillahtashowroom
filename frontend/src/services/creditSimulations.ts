import { supabase } from '../lib/supabase';
import {
  CreditSimulation,
  CreditSimulationPayload,
  CreditSimulationWithDetails
} from '../types/credit-simulations';

// Create new credit simulation
export const createCreditSimulation = async (
  payload: CreditSimulationPayload
): Promise<CreditSimulation> => {
  try {
    const { data, error } = await supabase
      .from('credit_simulations')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating credit simulation:', error);
    throw error;
  }
};

// Create credit simulation with automatic user detection
export const createCreditSimulationWithAuth = async (
  payload: Omit<CreditSimulationPayload, 'user_id'>
): Promise<CreditSimulation | null> => {
  try {
    // Get current user session
    const { data: { user } } = await supabase.auth.getUser();

    // If user is not logged in, return null (don't save)
    if (!user) {
      return null;
    }

    // Add user_id to payload
    const payloadWithUser = {
      ...payload,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('credit_simulations')
      .insert(payloadWithUser)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating credit simulation with auth:', error);
    throw error;
  }
};

// Fetch credit simulations by user ID
export const fetchUserCreditSimulations = async (
  userId: string,
  limit: number = 50
): Promise<CreditSimulationWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('credit_simulations')
      .select(`
        *,
        credit_parameters (
          name,
          financial_partners (
            name
          )
        ),
        financial_partners (
          name
        ),
        cars (
          brand,
          model,
          year,
          price
        ),
        user:users (
          email,
          full_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user credit simulations:', error);
    throw error;
  }
};

// Fetch current user's credit simulations
export const fetchMyCreditSimulations = async (
  limit: number = 50
): Promise<CreditSimulationWithDetails[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    return await fetchUserCreditSimulations(user.id, limit);
  } catch (error) {
    console.error('Error fetching my credit simulations:', error);
    throw error;
  }
};

// Fetch credit simulation by ID
export const fetchCreditSimulationById = async (
  id: string
): Promise<CreditSimulationWithDetails | null> => {
  try {
    const { data, error } = await supabase
      .from('credit_simulations')
      .select(`
        *,
        credit_parameters (
          name,
          financial_partners (
            name
          )
        ),
        financial_partners (
          name
        ),
        cars (
          brand,
          model,
          year,
          price
        ),
        user:users (
          email,
          full_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching credit simulation:', error);
    throw error;
  }
};

// Update credit simulation
export const updateCreditSimulation = async (
  id: string,
  payload: Partial<CreditSimulationPayload>
): Promise<CreditSimulation> => {
  try {
    const { data, error } = await supabase
      .from('credit_simulations')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating credit simulation:', error);
    throw error;
  }
};

// Save/unsave simulation (toggle is_saved flag)
export const toggleSaveSimulation = async (
  id: string,
  isSaved: boolean
): Promise<CreditSimulation> => {
  try {
    const { data, error } = await supabase
      .from('credit_simulations')
      .update({
        is_saved: isSaved,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling save simulation:', error);
    throw error;
  }
};

// Delete credit simulation
export const deleteCreditSimulation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('credit_simulations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting credit simulation:', error);
    throw error;
  }
};

// Get simulation statistics for user
export const getUserSimulationStats = async (
  userId?: string
): Promise<{
  total_simulations: number;
  saved_simulations: number;
  avg_monthly_payment: number;
  most_common_partner: string | null;
}> => {
  try {
    let query = supabase
      .from('credit_simulations')
      .select(`
        monthly_installment,
        is_saved,
        financial_partners (
          name
        )
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const simulations = data || [];
    const totalSimulations = simulations.length;
    const savedSimulations = simulations.filter(s => s.is_saved).length;
    const avgMonthlyPayment = totalSimulations > 0
      ? simulations.reduce((sum, s) => sum + s.monthly_installment, 0) / totalSimulations
      : 0;

    // Find most common partner
    const partnerCounts: Record<string, number> = {};
    simulations.forEach(sim => {
      const partner = sim.financial_partners as any;
      if (partner?.name) {
        partnerCounts[partner.name] = (partnerCounts[partner.name] || 0) + 1;
      }
    });

    const mostCommonPartner = Object.keys(partnerCounts).length > 0
      ? Object.entries(partnerCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    return {
      total_simulations: totalSimulations,
      saved_simulations: savedSimulations,
      avg_monthly_payment: avgMonthlyPayment,
      most_common_partner: mostCommonPartner
    };
  } catch (error) {
    console.error('Error getting user simulation stats:', error);
    throw error;
  }
};

// Search credit simulations
export const searchCreditSimulations = async (filters: {
  userId?: string;
  partnerId?: string;
  isSaved?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<CreditSimulationWithDetails[]> => {
  try {
    let query = supabase
      .from('credit_simulations')
      .select(`
        *,
        credit_parameters (
          name,
          financial_partners (
            name
          )
        ),
        financial_partners (
          name
        ),
        cars (
          brand,
          model,
          year,
          price
        )
      `);

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.partnerId) {
      query = query.eq('financial_partner_id', filters.partnerId);
    }
    if (filters.isSaved !== undefined) {
      query = query.eq('is_saved', filters.isSaved);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching credit simulations:', error);
    throw error;
  }
};