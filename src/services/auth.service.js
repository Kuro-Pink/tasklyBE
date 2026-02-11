import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';

/* ================= REGISTER ================= */
export const createUserService = async (data) => {
  const { name, email, password } = data;

  const exist = await User.findOne({ email });
  if (exist) throw new ApiError(400, 'Email already exists');

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
  });

  return user;
};

/* ================= LOGIN ================= */
export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, 'Wrong password');

  return user;
};

/* ================= SAVE REFRESH ================= */
export const saveRefreshTokenService = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  return user;
};

/* ================= REFRESH ================= */
export const refreshTokenService = async (token) => {
  const user = await User.findOne({ refreshToken: token });
  if (!user) throw new ApiError(401, 'Invalid token');

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
