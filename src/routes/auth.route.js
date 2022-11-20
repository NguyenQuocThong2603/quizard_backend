import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/login', (req, res) => {
  AuthController.login(req, res);
});

authRouter.post('/register', (req, res) => {
  AuthController.register(req, res);
});

export default authRouter;
