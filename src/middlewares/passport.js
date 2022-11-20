import passport from 'passport';
import LocalStrategy from 'passport-local';
import UserService from '../services/user.service.js';

passport.use(new LocalStrategy((username, password, cb) => {
  const user = UserService.findUser({
    username,
  });

  if (!user) {
    return cb(null, false, { message: 'Incorrect username or password' });
  }
}));
