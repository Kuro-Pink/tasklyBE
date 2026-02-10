import express from 'express';
import cors from 'cors';

import notFound from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// routes sẽ gắn ở đây sau

app.use(notFound);
app.use(errorMiddleware);

export default app;
