import express from 'express';
import GroupController from './group.controller.js';

const groupRouter = express.Router();

groupRouter.get('/', (req, res) => {
  GroupController.list(req, res);
});

groupRouter.post('/', (req, res) => {
  GroupController.create(req, res);
});

groupRouter.get('/:groupId', (req, res) => {
  GroupController.getDetail(req, res);
});

groupRouter.post('/changeRole', (req, res) => {
  GroupController.changeRole(req, res);
});

groupRouter.post('/kickUser', (req, res) => {
  GroupController.kickUser(req, res);
});

groupRouter.post('/inviteByEmail', (req, res) => {
  GroupController.inviteByEmail(req, res);
});

groupRouter.post('/join', (req, res) => {
  GroupController.join(req, res);
});
groupRouter.delete('/:groupId', (req, res) => {
  GroupController.deleteGroup(req, res);
});
export default groupRouter;
