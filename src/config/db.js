import mongoose from 'mongoose';
import config from './config.js';

function connectDB() {
  mongoose.connect(config.DATABASE_URL).then(() => console.log('Database connected'));
}

export default connectDB;
