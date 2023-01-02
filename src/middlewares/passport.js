import passport from 'passport';
import GooglePassport from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import LocalStrategy from 'passport-local';
import Jwt from 'passport-jwt';
import UserService from '../components/user/user.service.js';
import User from '../components/user/user.model.js';
import config from '../config/config.js';

passport.use(new LocalStrategy({ usernameField: 'email', sessionStorage: false, passReqToCallback: true }, async (req, email, password, cb) => {
  let user = await UserService.findUser(email);

  if (!user) {
    req.message = 'Invalid username or password';
    return cb(null, {});
  }
  try {
    if (!user.password) {
      req.message = 'Invalid username or password';
      return cb(null, {});
    }
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
      id: user.id,
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

const GoogleStrategy = GooglePassport.Strategy;
passport.use(new GoogleStrategy(
  {
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/redirect',
  },
  (async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await User.findOne({
        email: profile.emails[0].value,
      });
      if (user) {
        return cb(null, user);
      }
      const newUser = new User({
        email: profile.emails[0].value,
        name: `${profile.name.familyName} ${profile.name.givenName}`,
        isVerified: true,
      });
      await newUser.save();
      const userDTO = {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        dob: user.dob,
      };
      return cb(null, userDTO);
    } catch (err) {
      return cb(err, false);
    }
  }),
));

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
