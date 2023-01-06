import bcrypt from 'bcrypt';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { sendConfirmationEmail, sendForgotPasswordMail } from '../../config/nodemailer.js';
import UserService from '../user/user.service.js';
import LinkService from '../link/link.service.js';
import statusCode from '../../constants/statusCode.js';
import config from '../../config/config.js';

const AuthController = {

  createToken(user) {
    const token = jwt.sign(user, config.JWT_SECRET);
    return token;
  },

  async check(req, res) {
    return res.status(statusCode.OK).send();
  },

  async login(req, res) {
    if (req.message) {
      if (req.message === 'Invalid username or password') { return res.status(statusCode.BAD_REQUEST).json({ message: req.message }); }
      if (req.message === 'Not verified') { return res.status(statusCode.FORBIDDEN).json({ message: req.message }); }
    }
    const { user } = req;

    const accessToken = this.createToken(user);

    // const refreshToken = this.createToken(user, config.EXPIRED_TIME_REFRESH_TOKEN);

    try {
      // await UserService.updateRefreshToken(user.email, refreshToken);
      return res.status(statusCode.OK).json({ message: 'Login sucessfully', user, accessToken });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async register(req, res) {
    const { email, password, name, gender, dob, link } = req.body;

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const validDob = moment(dob, 'DD-MM-YYYY').isValid();
    if (!emailRegex.test(email) || !validDob) {
      return res.status(statusCode.BAD_REQUEST).json({ message: 'Input validation failed' });
    }

    // check if user already exists
    let user = await UserService.findUser(email);
    if (user !== null) {
      return res.status(statusCode.BAD_REQUEST).json({ message: 'Email already exists' });
    }

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const confirmationCode = nanoid(20);
    // create user
    try {
      user = await UserService.createUser(email, hash, name, gender, dob, confirmationCode);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
    sendConfirmationEmail(user, link);
    return res.status(statusCode.CREATED).json({ message: 'Create user successfully', user });
  },

  async verify(req, res) {
    const { confirmationCode } = req.params;
    try {
      const user = await UserService.findUserByConfirmationCode(confirmationCode);

      if (user) {
        user.isVerified = true;
        await user.save();
        return res.status(statusCode.OK).json({ message: 'Verified successfully' });
      }
      return res.status(statusCode.NOT_FOUND).json({ message: 'User not found' });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async googleLogin(req, res) {
    try {
      const { user } = req;
      const accessToken = this.createToken(user);
      const userValue = JSON.stringify(user);
      res.cookie('accessToken', accessToken, {
        maxAge: 5000, // Lifetime
        path: 'https://quizard-app.vercel.app/groups',
      }).cookie('user', userValue, {
        maxAge: 5000, // Lifetime
        path: 'https://quizard-app.vercel.app/groups',
      });
      res.redirect('https://quizard-app.vercel.app/groups');
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },
  async forgotPassword(req, res) {
    try {
      const { email, link } = req.body;
      const user = await UserService.findUser(email);
      if (!user) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Email not found' });
      }
      const url = await LinkService.createForgotPasswordLink(email);
      sendForgotPasswordMail(email, link, url.url);
      return res.status(statusCode.OK);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async resetPassword(req, res) {
    try {
      const { email, newPassword, url } = req.body;
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      await UserService.updatePasswordByEmail(email, hash);
      await LinkService.updateLinkStatus(url);
      return res.status(statusCode.OK);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },
};

export default AuthController;
