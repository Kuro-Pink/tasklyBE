import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { setupSocket } from './socket/index.js';

/* SERVER */
const server = http.createServer(app);

dotenv.config();

/* DB */
connectDB();

/* SOCKET */
const io = initSocket(server);
setupSocket(io);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
