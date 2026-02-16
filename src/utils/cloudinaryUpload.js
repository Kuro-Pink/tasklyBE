import cloudinary from '../config/cloudinary.js';
import ApiError from './ApiError.js';

export const uploadToCloudinary = async (file, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(new ApiError(500, 'Upload fail'));

      resolve({
        url: result.secure_url,
        publicId: result.public_id,
      });
    });

    stream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};
