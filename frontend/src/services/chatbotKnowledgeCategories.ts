import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL as string,
  process.env.REACT_APP_SUPABASE_ANON_KEY as string
);

export type ChatbotKnowledgeCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

type ListCategoryFilters = {
  is_active?: boolean;
  search?: string;
};

export async function listCategories(filters: ListCategoryFilters = {}, limit = 100) {
  let query = supabase
    .from('chatbot_knowledge_categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
    .limit(limit);

  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
  if (filters.search && filters.search.trim().length > 0) {
    const q = filters.search.trim();
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ChatbotKnowledgeCategory[];
}

export async function getCategoryById(id: number) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_categories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeCategory;
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_categories')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeCategory;
}

type CreateCategoryInput = Omit<
  ChatbotKnowledgeCategory,
  'id' | 'created_at' | 'updated_at'
>;

export async function createCategory(input: CreateCategoryInput) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_categories')
    .insert({
      name: input.name,
      slug: input.slug && input.slug.trim().length > 0 ? input.slug : toSlug(input.name),
      description: input.description ?? null,
      icon: input.icon ?? null,
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeCategory;
}

type UpdateCategoryPatch = Partial<
  Pick<
    ChatbotKnowledgeCategory,
    'name' | 'slug' | 'description' | 'icon' | 'display_order' | 'is_active'
  >
>;

export async function updateCategory(id: number, patch: UpdateCategoryPatch) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_categories')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeCategory;
}

export async function toggleCategoryActive(id: number, isActive: boolean) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_categories')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKnowledgeCategory;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase
    .from('chatbot_knowledge_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

type DisplayOrderRecord = { id: number; display_order: number };

export async function updateDisplayOrderBulk(records: DisplayOrderRecord[]) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_categories')
    .upsert(records, { onConflict: 'id' })
    .select('*');
  if (error) throw error;
  return (data || []) as ChatbotKnowledgeCategory[];
}

export async function getKnowledgeCountForCategory(categoryId: number) {
  const { count, error } = await supabase
    .from('chatbot_knowledge_base')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);
  if (error) throw error;
  return count || 0;
}