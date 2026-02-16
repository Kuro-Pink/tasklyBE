import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  createUserService,
  loginUserService,
  saveRefreshTokenService,
  refreshTokenService,
  updateUserInfoService,
  logoutService,
} from '../services/auth.service.js';

import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

/* ================= REGISTER ================= */
export const register = catchAsync(async (req, res) => {
  const user = await createUserService(req.body);

  res.status(201).json(new ApiResponse(201, user, 'Register success'));
});

/* ================= LOGIN ================= */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUserService(email, password);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await saveRefreshTokenService(user._id, refreshToken);

  res.json(
    new ApiResponse(
      200,
      {
        user,
        accessToken,
        refreshToken,
      },
      'Login success',
    ),
  );
});

/* ================= REFRESH ================= */
export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  const user = await refreshTokenService(refreshToken);

  const newAccessToken = generateAccessToken(user._id);

  res.json(
    new ApiResponse(
      200,
      {
        accessToken: newAccessToken,
      },
      'Token refreshed',
    ),
  );
});

/* ================= UPDATE ME ================= */
export const updateMe = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await updateUserInfoService(userId, req.body, req.file);

  res.json(new ApiResponse(200, user, 'Update profile success'));
});

/* ================= LOGOUT ================= */
export const logout = catchAsync(async (req, res) => {
  await logoutService(req.user._id);

  res.json(new ApiResponse(200, null, 'Logout success'));
});

/* ================= ME ================= */
export const me = catchAsync(async (req, res) => {
  res.json(new ApiResponse(200, req.user, 'OK'));
});
