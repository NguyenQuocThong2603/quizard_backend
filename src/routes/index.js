import userRouter from './user.route.js';

const createRoutes = app => {
  app.use('/users', userRouter);
};

export default createRoutes;
