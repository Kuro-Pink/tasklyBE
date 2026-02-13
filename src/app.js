import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import rateLimit from 'express-rate-limit';

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

/* RATE LIMIT */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.',
});

/* LOGGER */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/* ROUTES */
app.use('/api/v1', apiLimiter);
app.use('/api/v1', routes);

/* ERROR */
app.use(notFound);
app.use(errorMiddleware);

export default app;
