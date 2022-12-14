import express from 'express';
import sessionController from './session.controller.js';

const sessionRouter = express.Router();

sessionRouter.get('/', (req, res) => {
  sessionController.list(req, res);
});

sessionRouter.get('/questions', (req, res) => {
  sessionController.getQuestions(req, res);
});

sessionRouter.post('/questions', (req, res) => {
  sessionController.addQuestion(req, res);
});

sessionRouter.post('/questions/like', (req, res) => {
  sessionController.toggleLikeQuestion(req, res);
});

sessionRouter.post('/questions/markAnswered', (req, res) => {
  sessionController.toggleQuestionAnswered(req, res);
});

sessionRouter.get('/results', (req, res) => {
  sessionController.getResults(req, res);
});

sessionRouter.get('/chats', (req, res) => {
  sessionController.getChatMessage(req, res);
});

sessionRouter.get('/:id', (req, res) => {
  sessionController.detail(req, res);
});

sessionRouter.post('/', (req, res) => {
  sessionController.create(req, res);
});

sessionRouter.post('/chat', (req, res) => {
  sessionController.addMessage(req, res);
});
export default sessionRouter;
