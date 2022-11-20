import passport from 'passport';
import LocalStrategy from 'passport-local';
import UserService from '../../components/modules/user/user.service.js';

passport.use(new LocalStrategy((username, password, cb) => {
  const user = UserService.findUser({
    username,
  });

  if (user === null) {

  }
}));
