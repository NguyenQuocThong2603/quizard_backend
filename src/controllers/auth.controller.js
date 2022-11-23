import bcrypt from 'bcrypt';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import UserService from '../services/user.service.js';
import statusCode from '../constants/statusCode.js';
import config from '../config/config.js';

class AuthController {
  constructor(service) {
    this.service = service;
  }

  createToken(user, expiresIn) {
    const token = jwt.sign(user, config.JWT_SECRET, {
      expiresIn,
    });
    return token;
  }

  createAccessToken(req, res) {
    const newAccessToken = this.createToken();
  }

  async login(req, res) {
    const { user } = req;

    const accessToken = this.createToken(user, config.EXPIRED_TIME_ACCESS_TOKEN);

    const refreshToken = this.createToken(user, config.EXPIRED_TIME_REFRESH_TOKEN);

    try {
      await this.service.updateRefreshToken(user.email, refreshToken);
      return res.status(200).json({ message: 'Login sucessfully', accessToken, refreshToken });
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

    // create user
    try {
      user = await this.service.createUser(email, hash, name, gender, dob);
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
    return res.status(statusCode.CREATED).json({ message: 'Create user successfully', user: userDTO });
  }
}

export default new AuthController(UserService);
