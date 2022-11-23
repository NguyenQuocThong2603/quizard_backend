import nodemailer from 'nodemailer';
import createHtml from '../constants/contentOfConfirmationEmail.js';

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  secure: false,
  port: 587,
  auth: {
    user: 'quizard.work@gmail.com',
    pass: 'niuesskiubjvlqzw',
  },
});

function sendConfirmationEmail(user) {
  const html = createHtml(user);
  transport.sendMail({
    from: 'quizard.work@gmail.com',
    to: user.email,
    subject: 'Confirmation your account',
    html,
  }).catch(err => console.log(err));
}

export default sendConfirmationEmail;
