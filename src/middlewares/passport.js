import passport from 'passport';
import bcrypt from 'bcrypt';
import LocalStrategy from 'passport-local';
import Jwt from 'passport-jwt';
import UserService from '../services/user.service.js';
import config from '../config/config.js';

passport.use(new LocalStrategy({ usernameField: 'email', sessionStorage: false, passReqToCallback: true }, async (req, email, password, cb) => {
  let user = await UserService.findUser(email);

  if (!user) {
    req.message = 'Invalid username or password';
    return cb(null, {});
  }
  try {
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      req.message = 'Invalid username or password';
      return cb(null, {});
    }
    if (user.isVerified === false) {
      req.message = 'Not verified';
      return cb(null, {});
    }

    const userDTO = {
      _id: user._id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      dob: user.dob,
    };
    user = userDTO;
    return cb(null, user);
  } catch (err) {
    return cb(err, false);
  }
}));

const opts = {};

opts.jwtFromRequest = Jwt.ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.JWT_SECRET;
const JwtStrategy = Jwt.Strategy;

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  let user = await UserService.findUser(jwtPayload.email);
  if (user) {
    user = jwtPayload;
    return done(null, user);
  }
  return done(null, false);
}));
export default passport;
