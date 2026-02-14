import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

/* ================= REGISTER ================= */
export const createUserService = async (data) => {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Missing required fields');
  }

  const exist = await User.findOne({ email });
  if (exist) throw new ApiError(400, 'Email already exists');

  const user = await User.create({
    name,
    email,
    password,
  });

  // KHÔNG TRẢ PASSWORD
  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

/* ================= LOGIN ================= */
export const loginUserService = async (email, password) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email & password required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, 'Wrong password');

  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

/* ================= SAVE REFRESH ================= */
export const saveRefreshTokenService = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  return true;
};

/* ================= REFRESH ================= */
export const refreshTokenService = async (token) => {
  if (!token) throw new ApiError(401, 'Token required');

  const user = await User.findOne({ refreshToken: token });
  if (!user) throw new ApiError(401, 'Invalid token');

  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

/* ================= UPDATE USER INFO ================= */
export const updateUserInfoService = async (userId, data, file) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // ===== AVATAR =====
  if (file) {
    // xoá avatar cũ
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    const result = await uploadToCloudinary(file, 'taskly/avatars');

    user.avatar = result.url;
    user.avatarPublicId = result.publicId;
  }

  // ===== TEXT FIELDS =====
  if (data.name !== undefined) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone;

  await user.save();

  user.password = undefined; // ẩn password
  return user;
};

/* ================= LOGOUT ================= */
export const logoutService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.refreshToken = null;
  await user.save();

  return true;
};
