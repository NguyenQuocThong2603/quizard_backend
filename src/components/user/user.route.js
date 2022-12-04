import express from 'express';
import UserController from './user.controller.js';

const userRouter = express.Router();

userRouter.get('/profile', (req, res) => {
  UserController.profile(req, res);
});

userRouter.put('/profile', (req, res) => {
  UserController.editProfile(req, res);
});

userRouter.get('/logout', (req, res) => {
  UserController.logout(req, res);
});
export default userRouter;
