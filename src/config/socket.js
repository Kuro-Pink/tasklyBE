import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔵 Connected:', socket.id);

    socket.on('joinUser', (userId) => {
      socket.join(userId);
    });

    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
    });

    socket.on('disconnect', () => {
      console.log('⚪ Disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};
