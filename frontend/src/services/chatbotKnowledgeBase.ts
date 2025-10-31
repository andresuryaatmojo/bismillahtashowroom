import { supabase } from '../lib/supabase';

export type ValidationStatus = 'draft' | 'review' | 'approved' | 'rejected';
export type TrainingStatus = 'pending' | 'training' | 'trained' | 'failed';

export type ChatbotKnowledgeBase = {
  id: string;
  category_id: number;
  question: string;
  answer: string;
  intent_name: string | null;
  required_entities: any | null;
  priority: number;
  is_active: boolean;
  validation_status: ValidationStatus;
  usage_count: number;
  success_count: number;
  accuracy_rating: number;
  last_training_date: string | null;
  training_status: TrainingStatus;
  question_variations: any | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type ListFilters = {
  category_id?: number;
  is_active?: boolean;
  validation_status?: ValidationStatus;
  training_status?: TrainingStatus;
  intent_name?: string;
  search?: string;
};

export async function listKnowledgeBase(filters: ListFilters = {}, limit = 50) {
  let query = supabase
    .from('chatbot_knowledge_base')
    .select('*')
    .order('priority', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (filters.category_id !== undefined) query = query.eq('category_id', filters.category_id);
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
  if (filters.validation_status) query = query.eq('validation_status', filters.validation_status);
  if (filters.training_status) query = query.eq('training_status', filters.training_status);
  if (filters.intent_name) query = query.ilike('intent_name', `%${filters.intent_name}%`);
  if (filters.search) {
    query = query.textSearch('question', filters.search, { type: 'websearch', config: 'indonesian' });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ChatbotKnowledgeBase[];
}

export async function searchKnowledgeAnswerFTS(queryText: string, limit = 50) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .select('*')
    .textSearch('answer', queryText, { type: 'websearch', config: 'indonesian' })
    .order('priority', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as ChatbotKnowledgeBase[];
}

export async function getKnowledgeById(id: string) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeBase;
}

type CreateKnowledgeInput = Omit<
  ChatbotKnowledgeBase,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'usage_count'
  | 'success_count'
  | 'accuracy_rating'
>;

export async function createKnowledge(input: CreateKnowledgeInput) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .insert({
      category_id: input.category_id,
      question: input.question,
      answer: input.answer,
      intent_name: input.intent_name ?? null,
      required_entities: input.required_entities ?? null,
      priority: input.priority ?? 1,
      is_active: input.is_active ?? true,
      validation_status: input.validation_status ?? 'draft',
      last_training_date: input.last_training_date ?? null,
      training_status: input.training_status ?? 'pending',
      question_variations: input.question_variations ?? null,
      created_by: input.created_by ?? null,
      updated_by: input.updated_by ?? null
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeBase;
}

type UpdateKnowledgePatch = Partial<
  Pick<
    ChatbotKnowledgeBase,
    | 'category_id'
    | 'question'
    | 'answer'
    | 'intent_name'
    | 'required_entities'
    | 'priority'
    | 'is_active'
    | 'validation_status'
    | 'last_training_date'
    | 'training_status'
    | 'question_variations'
    | 'updated_by'
  >
>;

export async function updateKnowledge(id: string, patch: UpdateKnowledgePatch) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeBase;
}

export async function deleteKnowledge(id: string) {
  const { error } = await supabase
    .from('chatbot_knowledge_base')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function setValidationStatus(id: string, status: ValidationStatus) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .update({ validation_status: status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeBase;
}

export async function setTrainingStatus(id: string, status: TrainingStatus, lastDate?: string) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .update({
      training_status: status,
      last_training_date: lastDate ?? null
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeBase;
}

export async function toggleActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_base')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeBase;
}