import express from 'express';
import PresentationController from './presentation.controller.js';

const presentationRouter = express.Router();

presentationRouter.get('/', (req, res) => {
  PresentationController.list(req, res);
});

presentationRouter.post('/create', (req, res) => {
  PresentationController.create(req, res);
});

presentationRouter.get('/detail/:presentationId', (req, res) => {
  PresentationController.getDetail(req, res);
});

presentationRouter.post('/changeRole', (req, res) => {
  PresentationController.changeRole(req, res);
});

presentationRouter.post('/kickUser', (req, res) => {
  PresentationController.kickUser(req, res);
});

presentationRouter.post('/inviteByEmail', (req, res) => {
  PresentationController.inviteByEmail(req, res);
});

presentationRouter.post('/join', (req, res) => {
  PresentationController.join(req, res);
});
export default presentationRouter;
