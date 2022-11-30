import nodemailer from 'nodemailer';
import contentOfConfirmationEmail from '../constants/contentOfConfirmationEmail.js';
import contentOfInviteLink from '../constants/contentOfInviteLinkEmail.js';
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
  const html = contentOfConfirmationEmail(user);
  transport.sendMail({
    from: config.QUIZARD_MAIL,
    to: user.email,
    subject: 'Confirmation your account',
    html,
  }).catch(err => console.log(err));
}

function sendInviteLink(email, group) {
  const html = contentOfInviteLink(group);
  transport.sendMail({
    from: config.QUIZARD_MAIL,
    to: email,
    subject: 'Group invitation',
    html,
  }).catch(err => console.log(err));
}

export { sendConfirmationEmail, sendInviteLink };
