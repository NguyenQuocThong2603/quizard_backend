import authRouter from './auth.route.js';
import userRouter from './user.route.js';
import groupRouter from './group.route.js';
import inviteRouter from './invite.route.js';
import passport from '../middlewares/passport.js';
import verifyToken from '../middlewares/verifyToken.js';

const createRoutes = app => {
  app.use('/auth', authRouter);
  app.use('/users', passport.authenticate('jwt', { session: false }), userRouter);
  app.use('/groups', passport.authenticate('jwt', { session: false }), groupRouter);
  app.use('/invite', passport.authenticate('jwt', { session: false }), inviteRouter);
};

export default createRoutes;
