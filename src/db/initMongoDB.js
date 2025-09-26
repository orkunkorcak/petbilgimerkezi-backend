import mongoose from 'mongoose';

import { env } from '../utils/env.js';

export const initMongoDB = async () => {
  try {
    const user = env('MONGODB_USER');
    const pwd = env('MONGODB_PASSWORD');
    const url = env('MONGODB_URL');    

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/?retryWrites=true&w=majority&appName=PBM`,
    );
    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};
