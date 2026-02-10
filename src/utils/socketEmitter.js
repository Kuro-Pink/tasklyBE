import { getIO } from '../config/socket.js';

export const emitToUser = (userId, event, data) => {
  const io = getIO();
  io.to(userId.toString()).emit(event, data);
};

export const emitToProject = (projectId, event, data) => {
  const io = getIO();
  io.to(projectId.toString()).emit(event, data);
};
