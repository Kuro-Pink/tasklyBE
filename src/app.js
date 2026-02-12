import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

import routes from './routes/index.js';
import notFound from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
const app = express();

/* CORS */
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000'],
    credentials: true,
  }),
);

app.use(helmet());

/* BODY */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

/* SANITIZE */
app.use(mongoSanitize());
app.use(xss());

/* RATE LIMIT */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 300, // 300 request/IP
  message: 'Too many requests, please try again later.',
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api/v1', apiLimiter);
app.use('/api/v1', routes);

/* ERROR */
app.use(notFound);
app.use(errorMiddleware);

export default app;
