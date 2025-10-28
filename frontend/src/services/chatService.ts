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
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system' | 'car_info';
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
  const rooms = (data || []) as ChatRoomDb[];
  // Buang room yang peserta 1 dan 2 adalah diri sendiri
  return rooms.filter(r => !(r.user1_id === userId && r.user2_id === userId));
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
  if (senderId === receiverId) {
    throw new Error('Tidak bisa mengirim pesan ke diri sendiri');
  }
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

// Fungsi helper untuk fetch attachment data
async function fetchMessageAttachments(messageId: string): Promise<ChatAttachmentDb[]> {
  const { data, error } = await supabase
    .from('chat_attachments')
    .select('*')
    .eq('message_id', messageId);
  
  if (error) {
    console.error('Error fetching attachments:', error);
    return [];
  }
  
  return data || [];
}

export function subscribeRoomMessages(roomId: string, cb: (m: ChatMessageDb & { chat_attachments?: ChatAttachmentDb[] }) => void) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`,
    }, async (payload) => {
      const message = payload.new as ChatMessageDb;
      
      // Jika pesan adalah attachment, fetch data attachment-nya
      if (message.message_type === 'image' || message.message_type === 'file' || 
          message.message_type === 'audio' || message.message_type === 'video') {
        // Tunggu sebentar untuk memastikan attachment sudah tersimpan
        setTimeout(async () => {
          const attachments = await fetchMessageAttachments(message.id);
          cb({ ...message, chat_attachments: attachments });
        }, 100);
      } else {
        cb(message);
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function getRoomPeerId(room: ChatRoomDb, meId: string) {
  return room.user1_id === meId ? room.user2_id : room.user1_id;
}

// Fungsi untuk mengirim pesan 'car_info' sebagai user
export async function sendTextWithCarInfoMessage(
  roomId: string,
  senderId: string,
  receiverId: string,
  text: string,
  carId: string
) {
  // Ambil info mobil
  const { data: carInfo, error: carError } = await supabase
    .from('cars')
    .select(`
      id, title, price, year, mileage, color,
      car_brands (name),
      car_models (name),
      car_images (image_url)
    `)
    .eq('id', carId)
    .single();

  if (carError || !carInfo) throw carError || new Error('Car info not found');

  const carTitle =
    carInfo.title ||
    `${carInfo.car_brands?.[0]?.name || ''} ${carInfo.car_models?.[0]?.name || ''}`.trim();
  const carPrice = carInfo.price ? `Rp ${carInfo.price.toLocaleString('id-ID')}` : 'Harga tidak tersedia';
  const carImage =
    carInfo.car_images && carInfo.car_images.length > 0 ? carInfo.car_images[0].image_url : null;

  const payload = {
    room_id: roomId,
    sender_id: senderId,
    receiver_id: receiverId,
    message_text: JSON.stringify({
      text,
      carInfo: {
        carId: carInfo.id,
        title: carTitle,
        price: carPrice,
        year: carInfo.year,
        mileage: carInfo.mileage,
        color: carInfo.color,
        imageUrl: carImage
      }
    }),
    message_type: 'text' as ChatMessageDb['message_type'],
    chat_type: 'user' as ChatMessageDb['chat_type'],
    is_read: false
  };

  const { data, error } = await supabase
    .from('chat_messages')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as ChatMessageDb;
}

export async function createChatRoom(userId: string, sellerId: string, carId: string | null = null) {
  // Blokir pembuatan room dengan diri sendiri
  if (userId === sellerId) {
    throw new Error('Tidak dapat membuat room dengan diri sendiri');
  }

  // Cek apakah room sudah ada untuk peserta ini (tanpa memperhatikan carId)
  const query = supabase
    .from('chat_rooms')
    .select('*')
    .or(`and(user1_id.eq.${userId},user2_id.eq.${sellerId}),and(user1_id.eq.${sellerId},user2_id.eq.${userId})`)
    .eq('status', 'active')
    .order('last_message_at', { ascending: false })
    .limit(1);

  const { data: existingRooms, error: existingErr } = await query;
  if (existingErr) throw existingErr;

  if (existingRooms && existingRooms.length > 0) {
    const existingRoom = existingRooms[0] as ChatRoomDb;
    
    if (carId && existingRoom.car_id !== carId) {
      const { data: updatedRoom, error: updateErr } = await supabase
        .from('chat_rooms')
        .update({ car_id: carId })
        .eq('id', existingRoom.id)
        .select()
        .single();
        
      if (updateErr) throw updateErr;
      
      // Tidak kirim pesan car_info otomatis di sini
      return updatedRoom as ChatRoomDb;
    }
    
    return existingRoom;
  }

  const { data, error } = await supabase
    .from('chat_rooms')
    .insert([{
      user1_id: userId,
      user2_id: sellerId,
      car_id: carId,
      room_type: 'user_to_user',
      status: 'active'
    }])
    .select()
    .single();

  if (error) throw error;
  
  // Tidak kirim pesan car_info otomatis di sini
  return data as ChatRoomDb;
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
  const messageType: ChatMessageDb['message_type'] =
    file.type?.startsWith('image/')
      ? 'image'
      : file.type?.startsWith('audio/')
      ? 'audio'
      : file.type?.startsWith('video/')
      ? 'video'
      : 'file';

  const bucket = 'chat-attachments';
  const objectPath = `${roomId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${encodeURIComponent(file.name)}`;

  // 1) Upload ke Storage terlebih dulu
  const { error: uploadErr } = await supabase.storage.from(bucket).upload(objectPath, file, {
    upsert: false,
    contentType: file.type || undefined
  });
  if (uploadErr) {
    throw new Error(`Upload gagal: ${uploadErr.message}`);
  }

  // 2) Ambil URL file
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  let fileUrl = pub.publicUrl;

  // Jika bucket private dan ingin signed URL, aktifkan blok ini:
  // const { data: signed, error: signedErr } = await supabase.storage
  //   .from(bucket)
  //   .createSignedUrl(objectPath, 60 * 60 * 24 * 7); // 7 hari
  // if (signedErr) {
  //   // cleanup file jika gagal signed
  //   await supabase.storage.from(bucket).remove([objectPath]);
  //   throw new Error(`Gagal buat signed URL: ${signedErr.message}`);
  // }
  // fileUrl = signed.signedUrl;

  // 3) Insert pesan
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

  if (msgErr) {
    // Hapus file yang sudah terupload agar tidak orphan
    await supabase.storage.from(bucket).remove([objectPath]).catch(() => {});
    throw new Error(`Insert message gagal: ${msgErr.message}`);
  }

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
      height: null
    }])
    .select()
    .single();

  if (attErr) {
    // Cleanup file dan usahakan hapus pesan agar konsisten
    await supabase.storage.from(bucket).remove([objectPath]).catch(() => {});
    try {
      await supabase.from('chat_messages').delete().eq('id', msg.id);
    } catch (e) {}
    throw new Error(`Insert attachment gagal: ${attErr.message}`);
  }

  // Trigger `update_chat_room_on_new_message` akan update last_message_* dan unread.
  return { message: msg as ChatMessageDb, attachment: att as ChatAttachmentDb };
}

export async function fetchLatestMessageForRoom(roomId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, chat_attachments(*)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('fetchLatestMessageForRoom error', error);
    return null;
  }
  return data as ChatMessageDb | null;
}

// Bagian helper dan fungsi deleteRoomHistory
function extractStoragePathFromPublicUrl(url: string, bucket = 'chat-attachments') {
  try {
    const marker = `/object/public/${bucket}/`;
    const altMarker = `/${bucket}/`;
    const idx = url.indexOf(marker) >= 0
      ? url.indexOf(marker) + marker.length
      : url.indexOf(altMarker) + altMarker.length;
    if (idx < altMarker.length) return null;
    const path = url.substring(idx);
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export async function deleteRoomHistory(roomId: string) {
  // 1) Ambil semua pesan id di room
  const { data: msgs, error: msgErr } = await supabase
    .from('chat_messages')
    .select('id')
    .eq('room_id', roomId);
  if (msgErr) throw msgErr;

  const messageIds = (msgs || []).map(m => m.id);
  if (messageIds.length === 0) {
    await resetRoomMetadata(roomId);
    return { deletedMessageCount: 0, deletedAttachmentCount: 0 };
  }

  const { data: atts, error: attErr } = await supabase
    .from('chat_attachments')
    .select('id,file_url,message_id')
    .in('message_id', messageIds);
  if (attErr) throw attErr;

  const bucket = 'chat-attachments';
  const objectPaths = (atts || [])
    .map(a => extractStoragePathFromPublicUrl(a.file_url, bucket))
    .filter((p): p is string => !!p);

  if (objectPaths.length) {
    try {
      await supabase.storage.from(bucket).remove(objectPaths);
    } catch {
      // abaikan error storage agar proses DB tetap lanjut
    }
  }

  let deletedAttachmentCount = 0;
  if ((atts || []).length) {
    const { data: deletedAtts, error: delAttErr } = await supabase
      .from('chat_attachments')
      .delete()
      .in('message_id', messageIds)
      .select('id');
    if (delAttErr) throw delAttErr;
    deletedAttachmentCount = (deletedAtts || []).length;
  }

  const { data: deletedMsgs, error: delMsgErr } = await supabase
    .from('chat_messages')
    .delete()
    .eq('room_id', roomId)
    .select('id');
  if (delMsgErr) throw delMsgErr;

  const deletedMessageCount = (deletedMsgs || []).length;

  await resetRoomMetadata(roomId);

  return { deletedMessageCount, deletedAttachmentCount };
}

// Tambahkan fungsi ini
async function resetRoomMetadata(roomId: string) {
  const { error } = await supabase
    .from('chat_rooms')
    .update({
      last_message_id: null,
      last_message_preview: null,
      last_message_at: null,
      unread_count_user1: 0,
      unread_count_user2: 0
    })
    .eq('id', roomId);
  if (error) throw error;
}

export async function archiveRoom(roomId: string) {
  const { error } = await supabase
    .from('chat_rooms')
    .update({
      status: 'archived',
      last_message_id: null,
      last_message_preview: null,
      last_message_at: null,
      unread_count_user1: 0,
      unread_count_user2: 0
    })
    .eq('id', roomId);
  if (error) throw error;
}