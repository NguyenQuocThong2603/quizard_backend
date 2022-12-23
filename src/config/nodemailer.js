import nodemailer from 'nodemailer';
import contentOfConfirmationEmail from '../constants/contentOfConfirmationEmail.js';
import contentOfInviteLink from '../constants/contentOfInviteLinkEmail.js';
import contentOfForgotPasswordEmail from '../constants/contentOfForgotPasswordEmail.js';
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

function sendInviteLink(email, link) {
  const html = contentOfInviteLink(link);
  transport.sendMail({
    from: config.QUIZARD_MAIL,
    to: email,
    subject: 'Group invitation',
    html,
  }).catch(err => console.log(err));
}

function sendForgotPasswordMail(email, link, code) {
  const html = contentOfForgotPasswordEmail(link, code);
  transport.sendMail({
    from: config.QUIZARD_MAIL,
    to: email,
    subject: 'Reset password',
    html,
  }).catch(err => console.log(err));
}

export { sendConfirmationEmail, sendInviteLink, sendForgotPasswordMail };
