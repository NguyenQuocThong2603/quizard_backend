import authRouter from './auth.route.js';

const createRoutes = app => {
  app.use('/auth', authRouter);
};

export default createRoutes;
