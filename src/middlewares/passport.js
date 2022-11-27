import passport from 'passport';
import bcrypt from 'bcrypt';
import LocalStrategy from 'passport-local';
import Jwt from 'passport-jwt';
import jwt from 'jsonwebtoken';
import UserService from '../services/user.service.js';
import config from '../config/config.js';

passport.use(new LocalStrategy({ usernameField: 'email', sessionStorage: false }, async (email, password, cb) => {
  let user = await UserService.findUser(email);

  if (!user) {
    return cb(null, false, { message: 'Incorrect username or password' });
  }
  try {
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return cb(null, false, { message: 'Incorrect username or password' });
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
    return cb(err, { message: 'Internal server error' });
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
  console.log('Da vao');
  return done(null, false);
}));
export default passport;
