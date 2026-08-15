import { supabase } from './supabaseClient.js';

const BUCKET = 'menu-images';
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadMenuImage(file) {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("L'image dépasse 5 Mo.");
  }
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
