import express from 'express';
import cors from 'cors';
import { env } from './utils/env.js';
import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';



const PORT = Number(env('PORT', '3000'));

export const startServer = () => {
  const app = express();

  app.use(
    express.json({
      type: ['application/json', 'application/vnd.api+json'],
    }),
  );
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(
    cors({
      origin: isProduction
        ? ['https://petbilgimerkezi.com']
        : ['http://localhost:5173'],
      credentials: true,
    }),
  );

  app.use(cookieParser());


  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to the Pet Bilgi Merkezi API',
    });
  });

  app.use("/api", router);

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
