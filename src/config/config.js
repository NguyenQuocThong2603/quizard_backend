import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  EXPIRED_TIME_ACCESS_TOKEN: process.env.EXPIRED_TIME_ACCESS_TOKEN,
  EXPIRED_TIME_REFRESH_TOKEN: process.env.EXPIRED_TIME_REFRESH_TOKEN,
  QUIZARD_MAIL: process.env.QUIZARD_MAIL,
  QUIZARD_MAIL_PASSWORD: process.env.QUIZARD_MAIL_PASSWORD,
};

export default config;
