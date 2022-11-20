import express from 'express';
import UserController from '../components/modules/user/user.controller.js';

const userRouter = express.Router();

userRouter.post('/login', (req, res) => {
  UserController.login(req, res);
});

export default userRouter;
