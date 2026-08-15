import { supabase } from './supabaseClient.js';

const BUCKET = 'menu-images';
// Guards against pathologically huge files before we even try to decode
// them — actual uploads are the compressed output below, typically well
// under 1 MB regardless of the source photo's size.
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Fichier image invalide.'));
    };
    img.src = url;
  });
}

async function compressImage(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Échec de la compression de l'image."))),
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

export async function uploadMenuImage(file) {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("L'image dépasse 20 Mo.");
  }

  const blob = await compressImage(file);
  const path = `${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/jpeg',
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
