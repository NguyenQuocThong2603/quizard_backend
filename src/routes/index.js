import authRouter from '../components/auth/auth.route.js';
import userRouter from '../components/user/user.route.js';
import groupRouter from '../components/group/group.route.js';
import linkRouter from '../components/link/link.route.js';
import presentationRouter from '../components/presentation/presentation.route.js';
import passport from '../middlewares/passport.js';
import sessionRouter from '../components/session/session.route.js';

const createRoutes = app => {
  app.use('/auth', authRouter);
  app.use('/users', passport.authenticate('jwt', { session: false }), userRouter);
  app.use('/groups', passport.authenticate('jwt', { session: false }), groupRouter);
  app.use('/invite', passport.authenticate('jwt', { session: false }), linkRouter);
  app.use('/presentations', passport.authenticate('jwt', { session: false }), presentationRouter);
  app.use('/sessions', passport.authenticate('jwt', { session: false }), sessionRouter);
};

export default createRoutes;
