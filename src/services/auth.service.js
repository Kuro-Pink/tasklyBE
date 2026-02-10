import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import ApiError from '../utils/ApiError.js';

export const createUser = async (data) => {
  const existed = await User.findOne({ email: data.email });
  if (existed) throw new ApiError(400, 'Email already exists');

  return await User.create(data);
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Wrong password');

  return user;
};
