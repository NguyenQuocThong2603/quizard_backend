import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import passport from '../middlewares/passport.js';

const authRouter = express.Router();

authRouter.post('/login', passport.authenticate('local', {
  session: false,
}), (req, res) => {
  AuthController.login(req, res);
});

authRouter.post('/register', (req, res) => {
  AuthController.register(req, res);
});

authRouter.get('/accessToken', (req, res) => {
  AuthController.createAccessToken(req, res);
});
export default authRouter;
