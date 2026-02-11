import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

import {
  createUserService,
  loginUserService,
  saveRefreshTokenService,
  refreshTokenService,
  logoutService,
} from '../services/auth.service.js';

import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

/* ================= REGISTER ================= */
export const register = catchAsync(async (req, res) => {
  const user = await createUserService(req.body);

  res.status(201).json(new ApiResponse(201, 'Register success', user));
});

/* ================= LOGIN ================= */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUserService(email, password);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await saveRefreshTokenService(user._id, refreshToken);

  res.json(
    new ApiResponse(200, 'Login success', {
      accessToken,
      refreshToken,
      user,
    }),
  );
});

/* ================= REFRESH ================= */
export const refresh = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, 'No token');

  const user = await refreshTokenService(token);

  const newAccess = generateAccessToken(user._id);

  res.json(new ApiResponse(200, 'Refreshed', { accessToken: newAccess }));
});

/* ================= ME ================= */
export const me = catchAsync(async (req, res) => {
  res.json(new ApiResponse(200, 'OK', req.user));
});

/* ================= LOGOUT ================= */
export const logout = catchAsync(async (req, res) => {
  await logoutService(req.user._id);

  res.json(new ApiResponse(200, 'Logged out'));
});
