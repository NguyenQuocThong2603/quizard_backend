import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  EXPIRED_TIME_ACCESS_TOKEN: process.env.EXPIRED_TIME_ACCESS_TOKEN,
  EXPIRED_TIME_REFRESH_TOKEN: process.env.EXPIRED_TIME_REFRESH_TOKEN,
  QUIZARD_MAIL: process.env.QUIZARD_MAIL,
  QUIZARD_MAIL_PASSWORD: process.env.QUIZARD_MAIL_PASSWORD,
  APP_URL: 'localhost:3000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  // APP_URL: "quizard.vercel.app",
};

export default config;
