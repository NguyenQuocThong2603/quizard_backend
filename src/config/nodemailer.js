import nodemailer from 'nodemailer';
import createHtml from '../constants/contentOfConfirmationEmail.js';
import config from './config.js';

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  secure: false,
  port: 587,
  auth: {
    user: config.QUIZARD_MAIL,
    pass: config.QUIZARD_MAIL_PASSWORD,
  },
});

function sendConfirmationEmail(user) {
  const html = createHtml(user);
  transport.sendMail({
    from: config.QUIZARD_MAIL,
    to: user.email,
    subject: 'Confirmation your account',
    html,
  }).catch(err => console.log(err));
}

export default sendConfirmationEmail;
