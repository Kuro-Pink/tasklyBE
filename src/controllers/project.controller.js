import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  createProjectService,
  getProjectsService,
  getProjectDetailService,
  updateProjectService,
  deleteProjectService,
  addMemberService,
  removeMemberService,
  changeRoleService,
} from '../services/project.service.js';

/* ===================== CREATE ===================== */
export const createProject = catchAsync(async (req, res) => {
  const project = await createProjectService(req.body, req.user._id);
  res.json(new ApiResponse(201, project));
});

/* ===================== GET ALL ===================== */
export const getProjects = catchAsync(async (req, res) => {
  const projects = await getProjectsService(req.user._id);
  res.json(new ApiResponse(200, projects));
});

/* ===================== GET DETAIL ===================== */
export const getProjectDetail = catchAsync(async (req, res) => {
  const project = await getProjectDetailService(req.params.id);
  res.json(new ApiResponse(200, project));
});

/* ===================== UPDATE ===================== */
export const updateProject = catchAsync(async (req, res) => {
  const project = await updateProjectService(req.params.id, req.body, req.user._id);
  res.json(new ApiResponse(200, project));
});

/* ===================== DELETE ===================== */
export const deleteProject = catchAsync(async (req, res) => {
  await deleteProjectService(req.params.id, req.user._id);
  res.json(new ApiResponse(200, null, 'Project deleted'));
});

/* ===================== ADD MEMBER ===================== */
export const addMember = catchAsync(async (req, res) => {
  const { memberId, role } = req.body;

  const project = await addMemberService(req.params.id, memberId, role, req.user._id);

  res.json(new ApiResponse(200, project));
});

/* ===================== REMOVE MEMBER ===================== */
export const removeMember = catchAsync(async (req, res) => {
  const { memberId } = req.body;

  const project = await removeMemberService(req.params.id, memberId, req.user._id);

  res.json(new ApiResponse(200, project));
});

/* ===================== CHANGE ROLE ===================== */
export const changeRole = catchAsync(async (req, res) => {
  const { memberId, role } = req.body;

  const project = await changeRoleService(req.params.id, memberId, role, req.user._id);

  res.json(new ApiResponse(200, project));
});
