import express from 'express';
import GroupController from '../controllers/group.controller.js';

const groupRouter = express.Router();

groupRouter.get('/', (req, res) => {
  GroupController.list(req, res);
});

groupRouter.post('/create', (req, res) => {
  GroupController.create(req, res);
});
export default groupRouter;
