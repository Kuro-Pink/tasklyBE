import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
const app = express();

/* CORS */
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  }),
);

app.use(helmet());

/* BODY */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1', routes);

/* ERROR */
app.use(notFound);
app.use(errorMiddleware);

export default app;
