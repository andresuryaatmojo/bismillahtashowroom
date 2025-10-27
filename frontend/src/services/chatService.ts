import { supabase } from '../lib/supabase';

export type ChatRoomDb = {
  id: string;
  user1_id: string;
  user2_id: string;
  car_id: string | null;
  room_type: 'user_to_user' | 'user_to_admin' | 'user_to_bot';
  status: 'active' | 'archived' | 'muted' | 'blocked';
  last_message_id: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count_user1: number;
  unread_count_user2: number;
  is_escalated: boolean;
  escalation_level: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sla_time: number;
  is_muted_by_user1: boolean;
  is_muted_by_user2: boolean;
  created_at: string;
  updated_at: string;
};

export type ChatMessageDb = {
  id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  chat_type: 'user' | 'bot' | 'admin';
  is_read: boolean | null;
  read_at: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  reply_to_message_id: string | null;
  bot_intent: string | null;
  bot_confidence: number | null;
  bot_metadata: any | null;
  sent_at: string;
  created_at: string;
  updated_at: string;
};

export type ChatAttachmentDb = {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  attachment_type: 'image' | 'document' | 'audio' | 'video' | 'other';
  thumbnail_url: string | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  uploaded_at: string;
  created_at: string;
};

export async function fetchRoomsForUser(userId: string) {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data || []) as ChatRoomDb[];
}

export async function fetchMessages(roomId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, chat_attachments(*)')
    .eq('room_id', roomId)
    .order('sent_at', { ascending: true });
  if (error) throw error;
  return (data || []) as (ChatMessageDb & { chat_attachments?: ChatAttachmentDb[] })[];
}

export async function sendTextMessage(roomId: string, senderId: string, receiverId: string, text: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{
      room_id: roomId,
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: text,
      message_type: 'text',
      chat_type: 'user'
    }])
    .select()
    .single();
  if (error) throw error;
  // Trigger 'update_chat_room_on_new_message' akan mengisi last_message_* dan menaikkan unread count lawan bicara.
  return data as ChatMessageDb;
}

export async function markIncomingAsRead(roomId: string, userId: string) {
  // Tandai semua pesan masuk (receiver = userId) yang belum dibaca sebagai read
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('receiver_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  // Trigger 'reset_unread_count_on_read' akan mereset unread_count_* di chat_rooms.
}

export function subscribeRoomMessages(roomId: string, cb: (m: ChatMessageDb) => void) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`,
    }, (payload) => {
      cb(payload.new as ChatMessageDb);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function getRoomPeerId(room: ChatRoomDb, meId: string) {
  return room.user1_id === meId ? room.user2_id : room.user1_id;
}

function guessAttachmentType(mime: string): ChatAttachmentDb['attachment_type'] {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  // basic doc types
  if (mime.includes('pdf') || mime.includes('msword') || mime.includes('officedocument')) return 'document';
  return 'other';
}

export async function sendAttachmentMessage(
  roomId: string,
  senderId: string,
  receiverId: string,
  file: File
) {
  // 1) Insert pesan bertipe sesuai file
  const messageType: ChatMessageDb['message_type'] = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('audio/')
    ? 'audio'
    : file.type.startsWith('video/')
    ? 'video'
    : 'file';

  const { data: msg, error: msgErr } = await supabase
    .from('chat_messages')
    .insert([{
      room_id: roomId,
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: file.name,
      message_type: messageType,
      chat_type: 'user'
    }])
    .select()
    .single();
  if (msgErr) throw msgErr;

  // 2) Upload ke Supabase Storage
  const bucket = 'chat-attachments';
  const path = `${roomId}/${msg.id}/${Date.now()}-${encodeURIComponent(file.name)}`;
  const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (uploadErr) throw uploadErr;

  // 3) Dapatkan public URL (atau signed URL jika bucket non-public)
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  const fileUrl = pub.publicUrl;

  // 4) Insert attachment row
  const attachmentType = guessAttachmentType(file.type || '');
  const { data: att, error: attErr } = await supabase
    .from('chat_attachments')
    .insert([{
      message_id: msg.id,
      file_url: fileUrl,
      file_name: file.name,
      file_type: file.type || null,
      file_size: file.size,
      attachment_type: attachmentType,
      thumbnail_url: null,
      duration: null,
      width: null,
      height: null,
    }])
    .select()
    .single();
  if (attErr) throw attErr;

  // Trigger `update_chat_room_on_new_message` akan update last_message_* dan unread.
  return { message: msg as ChatMessageDb, attachment: att as ChatAttachmentDb };
}