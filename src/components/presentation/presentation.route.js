import express from 'express';
import PresentationController from './presentation.controller.js';

const presentationRouter = express.Router();

presentationRouter.get('/', (req, res) => {
  PresentationController.getPresentations(req, res);
});

presentationRouter.post('/', (req, res) => {
  PresentationController.create(req, res);
});

presentationRouter.get('/collaborators', (req, res) => {
  PresentationController.getCollaborators(req, res);
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

presentationRouter.post('/join', (req, res) => {
  PresentationController.join(req, res);
});

presentationRouter.post('/choose', (req, res) => {
  PresentationController.choose(req, res);
});

presentationRouter.post('/addCollaborator', (req, res) => {
  PresentationController.addCollaborator(req, res);
});

presentationRouter.delete('/collaborator', (req, res) => {
  PresentationController.deleteCollaborator(req, res);
});

export default presentationRouter;
