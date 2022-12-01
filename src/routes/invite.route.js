import express from 'express';
import inviteController from '../controllers/invite.controller.js';

const inviteRouter = express.Router();

inviteRouter.get('/create', (req, res) => {
  inviteController.createLink(req, res);
});
export default inviteRouter;
