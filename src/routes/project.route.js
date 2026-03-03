import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';
import {
  createProject,
  getProjects,
  getProjectDetail,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  changeRole,
} from '../controllers/project.controller.js';

import {
  inviteByEmail,
  acceptInvitation,
  joinByCode,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from '../controllers/invitation.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectDetail);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members', removeMember);
router.patch('/:id/role', changeRole);

router.post('/:id/invite', inviteByEmail);
router.post('/invitations/accept', acceptInvitation);
router.post('/join-by-code', joinByCode);
router.get('/:id/join-requests', getJoinRequests);
router.patch('/join-requests/:id/approve', approveJoinRequest);
router.patch('/join-requests/:id/reject', rejectJoinRequest);

export default router;
