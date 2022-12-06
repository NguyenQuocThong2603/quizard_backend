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

export default presentationRouter;
