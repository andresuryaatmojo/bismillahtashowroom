import { createClient } from '@supabase/supabase-js';

// ... existing code ...
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL!, process.env.REACT_APP_SUPABASE_ANON_KEY!);

export type ChatbotKeyword = {
  id: string;
  knowledge_id: string;
  keyword: string;
  weight: number; // perhatikan: bisa dikembalikan sebagai string, konversi ke number saat pakai.
  keyword_type: 'primary' | 'synonym' | 'related';
  created_at: string;
};

// List keywords untuk satu pengetahuan
export async function listKeywordsByKnowledgeId(knowledgeId: string) {
  const { data, error } = await supabase
    .from('chatbot_keywords')
    .select('*')
    .eq('knowledge_id', knowledgeId)
    .order('weight', { ascending: false })
    .order('keyword', { ascending: true });
  if (error) throw error;
  return data as ChatbotKeyword[];
}

// Cari keyword global (FTS bahasa Indonesia)
export async function searchKeywordsFTS(query: string) {
  const { data, error } = await supabase
    .from('chatbot_keywords')
    .select('*')
    .textSearch('keyword', query, { type: 'websearch', config: 'indonesian' })
    .limit(50);
  if (error) throw error;
  return data as ChatbotKeyword[];
}

// Tambah keyword baru
export async function addKeyword(input: Omit<ChatbotKeyword, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('chatbot_keywords')
    .insert({
      knowledge_id: input.knowledge_id,
      keyword: input.keyword,
      weight: input.weight ?? 1.0,
      keyword_type: input.keyword_type ?? 'primary',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKeyword;
}

// Update keyword (type/weight/keyword)
export async function updateKeyword(id: string, patch: Partial<Pick<ChatbotKeyword, 'keyword' | 'weight' | 'keyword_type'>>) {
  const { data, error } = await supabase
    .from('chatbot_keywords')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ChatbotKeyword;
}

// Hapus keyword
export async function deleteKeyword(id: string) {
  const { error } = await supabase
    .from('chatbot_keywords')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
// ... existing code ...