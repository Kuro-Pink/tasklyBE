export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    /* ===== JOIN PROJECT ROOM ===== */
    socket.on('joinProject', (projectId) => {
      if (!projectId) return;
      socket.join(projectId.toString());
      console.log(`Socket ${socket.id} joined project ${projectId}`);
    });

    /* ===== JOIN USER ROOM ===== */
    socket.on('joinUser', (userId) => {
      if (!userId) return;
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} joined user ${userId}`);
    });

    /* ===== LEAVE PROJECT ===== */
    socket.on('leaveProject', (projectId) => {
      socket.leave(projectId.toString());
    });

    /* ===== DISCONNECT ===== */
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
