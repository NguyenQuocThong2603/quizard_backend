import authRouter from '../components/auth/auth.route.js';
import userRouter from '../components/user/user.route.js';
import groupRouter from '../components/group/group.route.js';
import inviteRouter from '../components/invite/invite.route.js';
import passport from '../middlewares/passport.js';

const createRoutes = app => {
  app.use('/auth', authRouter);
  app.use('/users', passport.authenticate('jwt', { session: false }), userRouter);
  app.use('/groups', passport.authenticate('jwt', { session: false }), groupRouter);
  app.use('/invite', passport.authenticate('jwt', { session: false }), inviteRouter);
};

export default createRoutes;
