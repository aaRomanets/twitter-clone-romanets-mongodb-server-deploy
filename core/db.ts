import mongoose from "mongoose";

import dotenv from 'dotenv';
dotenv.config();

mongoose.Promise = Promise;

mongoose.connect(process.env.DB_URL as string, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

export {db , mongoose};