import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  inviteByEmailService,
  acceptInvitationService,
  joinByCodeService,
  getJoinRequestsService,
  approveJoinRequestService,
  rejectJoinRequestService,
} from '../services/project.service.js';

/* ================= INVITE BY EMAIL ================= */
export const inviteByEmail = catchAsync(async (req, res) => {
  const { email, role } = req.body;

  const result = await inviteByEmailService(req.params.id, email, role, req.user._id);

  res.json(new ApiResponse(200, result, 'Invitation sent'));
});

/* ================= ACCEPT INVITATION ================= */
export const acceptInvitation = catchAsync(async (req, res) => {
  const { token } = req.body;

  const project = await acceptInvitationService(token, req.user);

  res.json(new ApiResponse(200, project, 'Joined project'));
});

/* ================= JOIN BY CODE ================= */
export const joinByCode = catchAsync(async (req, res) => {
  const { inviteCode } = req.body;

  const request = await joinByCodeService(inviteCode, req.user._id);

  res.json(new ApiResponse(200, request, 'Request submitted'));
});

export const getJoinRequests = catchAsync(async (req, res) => {
  const { status } = req.query;

  const requests = await getJoinRequestsService(req.params.id, req.user._id, status || 'Pending');

  res.json(new ApiResponse(200, requests));
});

/* ================= APPROVE JOIN ================= */
export const approveJoinRequest = catchAsync(async (req, res) => {
  const project = await approveJoinRequestService(req.params.id, req.user._id);

  res.json(new ApiResponse(200, project, 'Member approved'));
});

export const rejectJoinRequest = catchAsync(async (req, res) => {
  const project = await rejectJoinRequestService(req.params.id, req.user._id);

  res.json(new ApiResponse(200, project, 'Request rejected'));
});
