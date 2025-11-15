import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ValidationStatus = 'draft' | 'review' | 'approved' | 'rejected';
type TrainingStatus = 'pending' | 'training' | 'trained' | 'failed';

type KnowledgeRow = {
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

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
};

type TagRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  tag_type: 'general' | 'feature' | 'category' | 'sentiment';
  is_active: boolean;
};

type KeywordRow = {
  id: string;
  knowledge_id: string;
  keyword: string;
  weight: number;
  keyword_type: 'primary' | 'synonym' | 'related';
  created_at: string;
};

const AdminKnowledgeChatbot: React.FC = () => {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole('admin');

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [rows, setRows] = useState<KnowledgeRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState<number | 'all'>('all');
  const [isActive, setIsActive] = useState<'all' | 'true' | 'false'>('all');
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | 'all'>('all');
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | 'all'>('all');
  const [search, setSearch] = useState<string>('');

  const [editing, setEditing] = useState<KnowledgeRow | null>(null);
  const [editorKeywords, setEditorKeywords] = useState<KeywordRow[]>([]);
  const [editorTags, setEditorTags] = useState<number[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  // Tag creation states
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagType, setNewTagType] = useState<TagRow['tag_type']>('general');
  const [savingTag, setSavingTag] = useState<boolean>(false);

  const filteredCount = useMemo(() => rows.length, [rows]);

  useEffect(() => {
    if (!isAdmin) return;
    loadCategories();
    loadTags();
    loadKnowledge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    loadKnowledge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, isActive, validationStatus, trainingStatus, search]);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('chatbot_knowledge_categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      setCategories((data || []) as CategoryRow[]);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function loadTags() {
    try {
      const { data, error } = await supabase
        .from('chatbot_tags')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      setTags((data || []) as TagRow[]);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function createTagQuick() {
    if (!newTagName.trim()) return;
    try {
      setSavingTag(true);
      const payload = {
        name: newTagName.trim(),
        slug: newTagName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: null,
        tag_type: newTagType,
        is_active: true
      };
      const { error } = await supabase
        .from('chatbot_tags')
        .insert(payload);
      if (error) throw error;
      setNewTagName('');
      await loadTags(); // refresh daftar tag aktif
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal membuat tag');
    } finally {
      setSavingTag(false);
    }
  }

  async function loadKnowledge() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('chatbot_knowledge_base')
        .select('*')
        .order('priority', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(200);

      if (categoryId !== 'all') query = query.eq('category_id', categoryId as number);
      if (isActive !== 'all') query = query.eq('is_active', isActive === 'true');
      if (validationStatus !== 'all') query = query.eq('validation_status', validationStatus as ValidationStatus);
      if (trainingStatus !== 'all') query = query.eq('training_status', trainingStatus as TrainingStatus);
      if (search.trim().length > 0) {
        query = query.textSearch('question', search.trim(), { type: 'websearch', config: 'indonesian' });
      }

      const { data, error } = await query;
      if (error) throw error;
      setRows((data || []) as KnowledgeRow[]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }

  async function openEditor(id: string) {
    try {
      const { data, error } = await supabase
        .from('chatbot_knowledge_base')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      const row = data as KnowledgeRow;
      setEditing(row);

      const { data: kw, error: kwErr } = await supabase
        .from('chatbot_keywords')
        .select('*')
        .eq('knowledge_id', id)
        .order('weight', { ascending: false })
        .order('keyword', { ascending: true });
      if (kwErr) throw kwErr;
      setEditorKeywords((kw || []) as KeywordRow[]);

      const { data: rel, error: relErr } = await supabase
        .from('chatbot_knowledge_tags')
        .select('tag_id')
        .eq('knowledge_id', id);
      if (relErr) throw relErr;
      setEditorTags((rel || []).map((r: any) => r.tag_id as number));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal membuka editor');
    }
  }

  function closeEditor() {
    setEditing(null);
    setEditorKeywords([]);
    setEditorTags([]);
    setSaving(false);
  }

  async function saveEditor() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const patch = {
        category_id: editing.category_id,
        question: editing.question,
        answer: editing.answer,
        intent_name: editing.intent_name,
        required_entities: editing.required_entities,
        priority: editing.priority,
        is_active: editing.is_active,
        validation_status: editing.validation_status,
        last_training_date: editing.last_training_date,
        training_status: editing.training_status,
        question_variations: editing.question_variations,
      };
      const { error: updErr } = await supabase
        .from('chatbot_knowledge_base')
        .update(patch)
        .eq('id', editing.id);
      if (updErr) throw updErr;

      const { data: existing, error: listError } = await supabase
        .from('chatbot_knowledge_tags')
        .select('tag_id')
        .eq('knowledge_id', editing.id);
      if (listError) throw listError;
      const existingSet = new Set((existing || []).map((r: any) => r.tag_id));
      const newSet = new Set(editorTags);
      const toAdd = Array.from(newSet).filter(id => !existingSet.has(id));
      const toRemove = Array.from(existingSet).filter(id => !newSet.has(id));

      if (toAdd.length > 0) {
        const addRows = toAdd.map(tagId => ({ knowledge_id: editing.id, tag_id: tagId }));
        const { error: addErr } = await supabase
          .from('chatbot_knowledge_tags')
          .upsert(addRows, { onConflict: 'knowledge_id,tag_id' });
        if (addErr) throw addErr;
      }
      if (toRemove.length > 0) {
        const { error: delErr } = await supabase
          .from('chatbot_knowledge_tags')
          .delete()
          .eq('knowledge_id', editing.id)
          .in('tag_id', toRemove);
        if (delErr) throw delErr;
      }

      await loadKnowledge();
      closeEditor();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  }

  async function createKnowledge() {
    const defaults: Partial<KnowledgeRow> = {
      question: 'Pertanyaan baru',
      answer: 'Jawaban baru',
      category_id: categories.find(c => c.is_active)?.id || (categories[0]?.id ?? 1),
      priority: 1,
      is_active: true,
      validation_status: 'draft',
      training_status: 'pending',
      created_by: user?.auth_user_id ?? user?.id ?? null,
      updated_by: user?.auth_user_id ?? user?.id ?? null,
    };
    try {
      const { data, error } = await supabase
        .from('chatbot_knowledge_base')
        .insert(defaults)
        .select('*')
        .single();
      if (error) throw error;
      await loadKnowledge();
      await openEditor(data.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal membuat knowledge');
    }
  }

  async function deleteKnowledge(id: string) {
    if (!window.confirm('Hapus knowledge ini? Tindakan tidak dapat dibatalkan.')) return;
    try {
      const { error } = await supabase
        .from('chatbot_knowledge_base')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadKnowledge();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghapus');
    }
  }

  async function addKeyword(k: Partial<KeywordRow>) {
    if (!editing) return;
    const payload = {
      knowledge_id: editing.id,
      keyword: (k.keyword || '').trim(),
      weight: Number(k.weight ?? 1.0),
      keyword_type: (k.keyword_type || 'primary') as KeywordRow['keyword_type'],
    };
    if (!payload.keyword) return;
    try {
      const { data, error } = await supabase
        .from('chatbot_keywords')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      setEditorKeywords(prev => [...prev, data as KeywordRow]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menambah keyword');
    }
  }

  async function updateKeyword(id: string, patch: Partial<KeywordRow>) {
    try {
      const { data, error } = await supabase
        .from('chatbot_keywords')
        .update({
          keyword: patch.keyword,
          weight: patch.weight,
          keyword_type: patch.keyword_type,
        })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      setEditorKeywords(prev => prev.map(k => (k.id === id ? (data as KeywordRow) : k)));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memperbarui keyword');
    }
  }

  async function removeKeyword(id: string) {
    try {
      const { error } = await supabase
        .from('chatbot_keywords')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setEditorKeywords(prev => prev.filter(k => k.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghapus keyword');
    }
  }

  if (!isAdmin) {
    return <div className="p-6">Anda tidak memiliki akses ke halaman ini.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Knowledge Chatbot</h1>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={createKnowledge}
        >
          Tambah Knowledge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Pencarian (FTS)</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="cari pada pertanyaan..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status Validasi</label>
          <select
            value={validationStatus}
            onChange={(e) => setValidationStatus(e.target.value as any)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status Training</label>
          <select
            value={trainingStatus}
            onChange={(e) => setTrainingStatus(e.target.value as any)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="training">Training</option>
            <option value="trained">Trained</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Aktif</label>
          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value as 'all' | 'true' | 'false')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">Semua</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="border rounded">
        <div className="p-3 text-sm text-gray-600">Hasil: {filteredCount} item</div>
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 w-2/5">Pertanyaan</th>
              <th className="p-3 w-1/6">Kategori</th>
              <th className="p-3 w-1/6">Validasi</th>
              <th className="p-3 w-1/6">Training</th>
              <th className="p-3 w-1/12">Prioritas</th>
              <th className="p-3 w-1/12">Aktif</th>
              <th className="p-3 w-1/6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-4 text-center">Memuat...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center">Tidak ada data</td></tr>
            )}
            {!loading && rows.map((r) => {
              const cat = categories.find(c => c.id === r.category_id);
              return (
                <tr key={r.id} className="border-t">
                  <td className="p-3 truncate">{r.question}</td>
                  <td className="p-3">{cat?.name || '-'}</td>
                  <td className="p-3">{r.validation_status}</td>
                  <td className="p-3">{r.training_status}</td>
                  <td className="p-3">{r.priority}</td>
                  <td className="p-3">{r.is_active ? 'Ya' : 'Tidak'}</td>
                  <td className="p-3 space-x-2">
                    <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => openEditor(r.id)}>Edit</button>
                    <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => deleteKnowledge(r.id)}>Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50">
          <div className="bg-white w-full max-w-5xl mt-10 rounded shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Edit Knowledge</h2>
              <button className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={closeEditor}>Tutup</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium">Pertanyaan</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-24"
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                />
                <label className="block text-sm font-medium">Jawaban</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-32"
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                />
                <label className="block text-sm font-medium">Intent Name (opsional)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editing.intent_name || ''}
                  onChange={(e) => setEditing({ ...editing, intent_name: e.target.value })}
                />
                <label className="block text-sm font-medium">Kategori</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={editing.category_id}
                  onChange={(e) => setEditing({ ...editing, category_id: Number(e.target.value) })}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Prioritas</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="w-full border rounded px-3 py-2"
                      value={editing.priority}
                      onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Aktif</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editing.is_active ? 'true' : 'false'}
                      onChange={(e) => setEditing({ ...editing, is_active: e.target.value === 'true' })}
                    >
                      <option value="true">Ya</option>
                      <option value="false">Tidak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Validasi</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editing.validation_status}
                      onChange={(e) => setEditing({ ...editing, validation_status: e.target.value as ValidationStatus })}
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Training</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editing.training_status}
                      onChange={(e) => setEditing({ ...editing, training_status: e.target.value as TrainingStatus })}
                    >
                      <option value="pending">Pending</option>
                      <option value="training">Training</option>
                      <option value="trained">Trained</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Terakhir Training</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-3 py-2"
                      value={editing.last_training_date ? new Date(editing.last_training_date).toISOString().slice(0,16) : ''}
                      onChange={(e) => setEditing({ ...editing, last_training_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border rounded">
                  <div className="p-2 font-medium bg-gray-50 border-b">Keywords</div>
                  <div className="p-3 space-y-2">
                    {editorKeywords.map(k => (
                      <div key={k.id} className="grid grid-cols-5 gap-2 items-center">
                        <input
                          className="col-span-2 border rounded px-2 py-1"
                          value={k.keyword}
                          onChange={(e) => updateKeyword(k.id, { keyword: e.target.value })}
                        />
                        <select
                          className="col-span-1 border rounded px-2 py-1"
                          value={k.keyword_type}
                          onChange={(e) => updateKeyword(k.id, { keyword_type: e.target.value as KeywordRow['keyword_type'] })}
                        >
                          <option value="primary">Primary</option>
                          <option value="synonym">Synonym</option>
                          <option value="related">Related</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min={0.01}
                          max={10.0}
                          className="col-span-1 border rounded px-2 py-1"
                          value={k.weight}
                          onChange={(e) => updateKeyword(k.id, { weight: Number(e.target.value) })}
                        />
                        <button
                          className="col-span-1 px-2 py-1 rounded bg-red-600 text-white"
                          onClick={() => removeKeyword(k.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                    <div className="grid grid-cols-5 gap-2">
                      <input id="new_kw_text" className="col-span-2 border rounded px-2 py-1" placeholder="keyword..." />
                      <select id="new_kw_type" className="col-span-1 border rounded px-2 py-1" defaultValue="primary">
                        <option value="primary">Primary</option>
                        <option value="synonym">Synonym</option>
                        <option value="related">Related</option>
                      </select>
                      <input id="new_kw_weight" type="number" step="0.01" min={0.01} max={10.0} defaultValue={1.0} className="col-span-1 border rounded px-2 py-1" />
                      <button
                        className="col-span-1 px-2 py-1 rounded bg-blue-600 text-white"
                        onClick={() => {
                          const text = (document.getElementById('new_kw_text') as HTMLInputElement)?.value || '';
                          const type = (document.getElementById('new_kw_type') as HTMLSelectElement)?.value || 'primary';
                          const weightStr = (document.getElementById('new_kw_weight') as HTMLInputElement)?.value || '1.0';
                          addKeyword({ keyword: text, keyword_type: type as any, weight: Number(weightStr) });
                        }}
                      >
                        Tambah
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Bobot 0.01–10.00 sesuai constraint tabel.</p>
                  </div>
                </div>

                <div className="border rounded">
                  <div className="p-2 font-medium bg-gray-50 border-b">Tags</div>
                  <div className="p-3 space-y-3">
                    {tags.length === 0 && (
                      <div className="text-sm text-gray-600">Belum ada tag aktif. Tambahkan di sini:</div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Nama tag baru"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                      <select
                        value={newTagType}
                        onChange={(e) => setNewTagType(e.target.value as TagRow['tag_type'])}
                        className="border rounded px-2 py-1"
                      >
                        <option value="general">General</option>
                        <option value="feature">Feature</option>
                        <option value="category">Category</option>
                        <option value="sentiment">Sentiment</option>
                      </select>
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                        onClick={createTagQuick}
                        disabled={savingTag}
                      >
                        {savingTag ? 'Menyimpan...' : 'Tambah Tag'}
                      </button>
                    </div>
                
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tags.map(t => (
                        <label key={t.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editorTags.includes(t.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditorTags(prev => checked ? [...prev, t.id] : prev.filter(id => id !== t.id));
                            }}
                          />
                          <span>{t.name}</span>
                          <span className="text-xs text-gray-500">({t.tag_type})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-600">
                Penggunaan: {editing.usage_count} | Sukses: {editing.success_count} | Akurasi: {Number(editing.accuracy_rating).toFixed(4)}
              </div>
              <div className="space-x-2">
                <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={closeEditor} disabled={saving}>Batal</button>
                <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={saveEditor} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKnowledgeChatbot;