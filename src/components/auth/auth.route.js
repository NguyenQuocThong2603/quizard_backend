import express from 'express';
import AuthController from './auth.controller.js';
import LinkController from '../link/link.controller.js';
import passport from '../../middlewares/passport.js';

const authRouter = express.Router();

authRouter.post('/login', passport.authenticate('local', {
  session: false,
}), (req, res) => {
  AuthController.login(req, res);
});

authRouter.post('/check', passport.authenticate('jwt', { session: false }), (req, res) => {
  AuthController.check(req, res);
});

authRouter.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

authRouter.get('/google/redirect', passport.authenticate('google', { session: false }), (req, res) => {
  AuthController.googleLogin(req, res);
});

authRouter.post('/register', (req, res) => {
  AuthController.register(req, res);
});

authRouter.get('/accessToken', (req, res) => {
  AuthController.createAccessToken(req, res);
});

authRouter.get('/confirm/:confirmationCode', (req, res) => {
  AuthController.verify(req, res);
});

authRouter.post('/forgotPassword', (req, res) => {
  AuthController.forgotPassword(req, res);
});

authRouter.post('/resetPassword/check', (req, res) => {
  LinkController.checkLink(req, res);
});

authRouter.post('/resetPassword', (req, res) => {
  AuthController.resetPassword(req, res);
});
export default authRouter;
