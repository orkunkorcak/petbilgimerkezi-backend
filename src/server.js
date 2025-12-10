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

  const isProduction = process.env.NODE_ENV === 'production';

  // ✅ CORS yapılandırması
  const allowedOrigins = [
    'http://localhost:5173',
    'https://www.petbilgimerkezi.com',
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // Postman gibi origin'i olmayan istekleri de kabul et
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // 🍪 cookie gönderimi için zorunlu
    }),
  );

  app.use(
    express.json({ type: ['application/json', 'application/vnd.api+json'] }),
  );

  // ✅ Cookie parser'ı CORS'tan sonra kullan
  app.use(cookieParser());

  // Test endpoint
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Pet Bilgi Merkezi API' });
  });

  // ✅ Ana router
  app.use('/api', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌍 Mode: ${isProduction ? 'Production' : 'Development'}`);
  });
};
