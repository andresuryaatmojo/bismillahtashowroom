import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL as string,
  process.env.REACT_APP_SUPABASE_ANON_KEY as string
);

export type TagType = 'general' | 'feature' | 'category' | 'sentiment';

export type ChatbotTag = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  tag_type: TagType;
  is_active: boolean;
  created_at: string;
};

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

type ListTagFilters = {
  is_active?: boolean;
  tag_type?: TagType;
  search?: string;
  limit?: number;
};

export async function listTags(filters: ListTagFilters = {}) {
  let query = supabase
    .from('chatbot_tags')
    .select('*')
    .order('name', { ascending: true })
    .limit(filters.limit ?? 200);

  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
  if (filters.tag_type) query = query.eq('tag_type', filters.tag_type);
  if (filters.search && filters.search.trim().length > 0) {
    const q = filters.search.trim();
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ChatbotTag[];
}

export async function listActiveTagsByType(tagType?: TagType) {
  const filters: ListTagFilters = { is_active: true };
  if (tagType) filters.tag_type = tagType;
  return listTags(filters);
}

export async function getTagById(id: number) {
  const { data, error } = await supabase
    .from('chatbot_tags')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ChatbotTag;
}

export async function getTagBySlug(slug: string) {
  const { data, error } = await supabase
    .from('chatbot_tags')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as ChatbotTag;
}

type CreateTagInput = Omit<ChatbotTag, 'id' | 'created_at'>;

export async function createTag(input: CreateTagInput) {
  const { data, error } = await supabase
    .from('chatbot_tags')
    .insert({
      name: input.name,
      slug: input.slug && input.slug.trim().length > 0 ? input.slug : toSlug(input.name),
      description: input.description ?? null,
      tag_type: (input.tag_type as TagType) ?? 'general',
      is_active: input.is_active ?? true
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotTag;
}

type UpdateTagPatch = Partial<
  Pick<ChatbotTag, 'name' | 'slug' | 'description' | 'tag_type' | 'is_active'>
>;

export async function updateTag(id: number, patch: UpdateTagPatch) {
  const { data, error } = await supabase
    .from('chatbot_tags')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotTag;
}

export async function toggleTagActive(id: number, isActive: boolean) {
  const { data, error } = await supabase
    .from('chatbot_tags')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotTag;
}

export async function deleteTag(id: number) {
  // Hapus tag; relasi di chatbot_knowledge_tags menggunakan ON DELETE CASCADE sehingga asosiasi akan ikut terhapus.
  const { error } = await supabase
    .from('chatbot_tags')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function countKnowledgeUsingTag(tagId: number) {
  const { count, error } = await supabase
    .from('chatbot_knowledge_tags')
    .select('knowledge_id', { count: 'exact', head: true })
    .eq('tag_id', tagId);
  if (error) throw error;
  return count || 0;
}

// Auto-complete untuk form: mencari tag aktif berdasarkan input teks
export async function autocompleteTags(queryText: string, limit = 20) {
  const { data, error } = await supabase
    .from('chatbot_tags')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${queryText}%,slug.ilike.%${queryText}%`)
    .order('name', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data || []) as ChatbotTag[];
}