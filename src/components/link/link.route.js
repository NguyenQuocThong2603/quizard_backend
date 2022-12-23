import express from 'express';
import linkController from './link.controller.js';

const linkRouter = express.Router();

linkRouter.post('/', (req, res) => {
  linkController.getLink(req, res);
});

linkRouter.get('/create', (req, res) => {
  linkController.createLink(req, res);
});

export default linkRouter;
