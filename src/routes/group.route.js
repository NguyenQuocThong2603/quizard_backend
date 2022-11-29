import express from 'express';
import GroupController from '../controllers/group.controller.js';

const groupRouter = express.Router();

groupRouter.get('/', (req, res) => {
  GroupController.list(req, res);
});

groupRouter.post('/create', (req, res) => {
  GroupController.create(req, res);
});

groupRouter.get('/detail/:groupId', (req, res) => {
  GroupController.getDetail(req, res);
});

groupRouter.post('/changeRole', (req, res) => {
  GroupController.changeRole(req, res);
});
export default groupRouter;
