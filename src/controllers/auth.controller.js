import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { createUser, loginUser } from '../services/auth.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const register = catchAsync(async (req, res) => {
  const user = await createUser(req.body);

  res.status(201).json(new ApiResponse(201, 'Register success', user));
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res.json(
    new ApiResponse(200, 'Login success', {
      accessToken,
      refreshToken,
      user,
    }),
  );
});

export const refresh = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, 'No token');

  const user = await User.findOne({ refreshToken: token });
  if (!user) throw new ApiError(401, 'Invalid token');

  const newAccess = generateAccessToken(user._id);

  res.json(new ApiResponse(200, 'Refreshed', { accessToken: newAccess }));
});

export const me = catchAsync(async (req, res) => {
  res.json(new ApiResponse(200, 'OK', req.user));
});
