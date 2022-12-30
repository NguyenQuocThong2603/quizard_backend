import express from 'express';
import PresentationController from './presentation.controller.js';

const presentationRouter = express.Router();

presentationRouter.get('/', (req, res) => {
  PresentationController.list(req, res);
});

presentationRouter.post('/', (req, res) => {
  PresentationController.create(req, res);
});

presentationRouter.get('/:presentationId', (req, res) => {
  PresentationController.getDetail(req, res);
});

presentationRouter.delete('/delete', (req, res) => {
  PresentationController.delete(req, res);
});

presentationRouter.post('/save', (req, res) => {
  PresentationController.save(req, res);
});

presentationRouter.post('/live', (req, res) => {
  PresentationController.live(req, res);
});

presentationRouter.get('/current-session/:presentationId', (req, res) => {
  PresentationController.getCurrentSession(req, res);
});

presentationRouter.post('/join', (req, res) => {
  PresentationController.join(req, res);
});

presentationRouter.post('/vote', (req, res) => {
  PresentationController.vote(req, res);
});


export default presentationRouter;
