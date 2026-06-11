/**
 * อัปโหลดรูปภาพขึ้น Cloudinary แบบ Unsigned จาก Browser โดยตรง
 * @param {File} file - ไฟล์รูปภาพจาก Input element
 * @returns {Promise<string>} - URL ของรูปภาพหลังจากอัปโหลดสำเร็จ
 */
export async function uploadImage(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials missing in .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'การอัปโหลดรูปภาพล้มเหลว');
  }

  const data = await response.json();
  return data.secure_url;
}
