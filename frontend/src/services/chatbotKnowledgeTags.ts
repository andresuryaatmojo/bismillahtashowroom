import { supabase } from '../lib/supabase';

export type ChatbotKnowledgeTag = {
  knowledge_id: string; // uuid
  tag_id: number;       // integer
  created_at: string;
};

// List tags yang terhubung ke sebuah knowledge_id.
// Jika PostgREST mengenali FK, nested select `chatbot_tags(*)` akan mengembalikan detail tag.
// Jika tidak, Anda tetap mendapat daftar (knowledge_id, tag_id) dan bisa fetch detail tag terpisah.
export async function listTagsByKnowledgeId(knowledgeId: string) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_tags')
    .select('knowledge_id, tag_id, created_at, chatbot_tags(*)')
    .eq('knowledge_id', knowledgeId)
    .order('tag_id', { ascending: true });

  if (error) throw error;
  return data as Array<
    ChatbotKnowledgeTag & {
      chatbot_tags?: any; // detail tag (jika FK relationship otomatis terdeteksi)
    }
  >;
}

// List knowledge yang memiliki sebuah tag_id.
// Sama seperti di atas, nested select ke `chatbot_knowledge_base(*)` akan mengembalikan detail knowledge jika FK dikenal.
export async function listKnowledgeByTagId(tagId: number) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_tags')
    .select('knowledge_id, tag_id, created_at, chatbot_knowledge_base(*)')
    .eq('tag_id', tagId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Array<
    ChatbotKnowledgeTag & {
      chatbot_knowledge_base?: any; // detail knowledge (jika FK relationship otomatis terdeteksi)
    }
  >;
}

// Tambahkan tag ke sebuah knowledge.
// Menggunakan upsert agar aman terhadap duplikasi (PK komposit: knowledge_id + tag_id).
export async function addTagToKnowledge(knowledgeId: string, tagId: number) {
  const { data, error } = await supabase
    .from('chatbot_knowledge_tags')
    .upsert(
      [{ knowledge_id: knowledgeId, tag_id: tagId }],
      { onConflict: 'knowledge_id,tag_id' }
    )
    .select('*');

  if (error) throw error;
  return (data || []) as ChatbotKnowledgeTag[];
}

// Hapus tag dari sebuah knowledge.
export async function removeTagFromKnowledge(knowledgeId: string, tagId: number) {
  const { error } = await supabase
    .from('chatbot_knowledge_tags')
    .delete()
    .eq('knowledge_id', knowledgeId)
    .eq('tag_id', tagId);

  if (error) throw error;
}

// Ganti seluruh daftar tag untuk sebuah knowledge dengan daftar baru (sinkronisasi).
export async function replaceKnowledgeTags(knowledgeId: string, newTagIds: number[]) {
  // Ambil yang ada saat ini
  const { data: existing, error: listError } = await supabase
    .from('chatbot_knowledge_tags')
    .select('tag_id')
    .eq('knowledge_id', knowledgeId);

  if (listError) throw listError;

  const existingIds = new Set((existing || []).map((r: any) => r.tag_id));
  const newIds = new Set(newTagIds);

  const toAdd = Array.from(newIds).filter(id => !existingIds.has(id));
  const toRemove = Array.from(existingIds).filter(id => !newIds.has(id));

  // Tambah yang belum ada (upsert batch)
  if (toAdd.length > 0) {
    const addRows = toAdd.map(tagId => ({ knowledge_id: knowledgeId, tag_id: tagId }));
    const { error: addError } = await supabase
      .from('chatbot_knowledge_tags')
      .upsert(addRows, { onConflict: 'knowledge_id,tag_id' });
    if (addError) throw addError;
  }

  // Hapus yang tidak lagi dipakai
  if (toRemove.length > 0) {
    const { error: delError } = await supabase
      .from('chatbot_knowledge_tags')
      .delete()
      .eq('knowledge_id', knowledgeId)
      .in('tag_id', toRemove);
    if (delError) throw delError;
  }

  // Kembalikan state akhir
  const { data: final, error: finalError } = await supabase
    .from('chatbot_knowledge_tags')
    .select('knowledge_id, tag_id, created_at, chatbot_tags(*)')
    .eq('knowledge_id', knowledgeId)
    .order('tag_id', { ascending: true });

  if (finalError) throw finalError;
  return final as Array<
    ChatbotKnowledgeTag & {
      chatbot_tags?: any;
    }
  >;
}

// Hitung jumlah tag yang terpasang pada sebuah knowledge.
export async function countTagsForKnowledge(knowledgeId: string) {
  const { count, error } = await supabase
    .from('chatbot_knowledge_tags')
    .select('tag_id', { count: 'exact', head: true })
    .eq('knowledge_id', knowledgeId);

  if (error) throw error;
  return count || 0;
}