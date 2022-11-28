import bcrypt from 'bcrypt';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import sendConfirmationEmail from '../config/nodemailer.js';
import UserService from '../services/user.service.js';
import statusCode from '../constants/statusCode.js';
import config from '../config/config.js';

class AuthController {
  constructor(service) {
    this.service = service;
  }

  createToken(user) {
    const token = jwt.sign(user, config.JWT_SECRET);
    return token;
  }

  async login(req, res) {
    if (req.message) {
      if (req.message === 'Invalid username or password') { return res.status(statusCode.BAD_REQUEST).json({ message: req.message }); }
      if (req.message === 'Not verified') { return res.status(statusCode.FORBIDDEN).json({ message: req.message }); }
    }
    const { user } = req;

    const accessToken = this.createToken(user);

    // const refreshToken = this.createToken(user, config.EXPIRED_TIME_REFRESH_TOKEN);

    try {
      // await this.service.updateRefreshToken(user.email, refreshToken);
      return res.status(statusCode.OK).json({ message: 'Login sucessfully', accessToken });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  async register(req, res) {
    const { email, password, name, gender, dob } = req.body;

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const validDob = moment(dob, 'DD-MM-YYYY').isValid();
    if (!emailRegex.test(email) || !validDob) {
      return res.status(statusCode.BAD_REQUEST).json({ message: 'Input validation failed' });
    }

    // check if user already exists
    let user = await this.service.findUser(email);
    if (user !== null) {
      return res.status(statusCode.BAD_REQUEST).json({ message: 'Email already exists' });
    }

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const confirmationCode = nanoid(10);
    // create user
    try {
      user = await this.service.createUser(email, hash, name, gender, dob, confirmationCode);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }

    const userDTO = {
      _id: user._id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      dob: user.dob,
    };
    sendConfirmationEmail(user);
    return res.status(statusCode.CREATED).json({ message: 'Create user successfully', user: userDTO });
  }

  async verify(req, res) {
    const { confirmationCode } = req.params;
    try {
      const user = await this.service.findUserByConfirmationCode(confirmationCode);

      if (user) {
        user.isVerified = true;
        await user.save();
        return res.status(statusCode.OK).json({ message: 'Verified successfully' });
      }
      return res.status(statusCode.NOT_FOUND).json({ message: 'User not found' });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }
}

export default new AuthController(UserService);
