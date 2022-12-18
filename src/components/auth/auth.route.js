import express from 'express';
import AuthController from './auth.controller.js';
import passport from '../../middlewares/passport.js';

const authRouter = express.Router();

authRouter.post('/login', passport.authenticate('local', {
  session: false,
}), (req, res) => {
  AuthController.login(req, res);
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
export default authRouter;
