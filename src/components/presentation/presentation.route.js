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

presentationRouter.post('/delete', (req, res) => {
  PresentationController.delete(req, res);
});

presentationRouter.post('/save', (req, res) => {
  PresentationController.save(req, res);
});

presentationRouter.post('/live', (req, res) => {
  PresentationController.live(req, res);
});

presentationRouter.post('/join', (req, res) => {
  PresentationController.join(req, res);
});

presentationRouter.post('/choose', (req, res) => {
  PresentationController.choose(req, res);
});

export default presentationRouter;
