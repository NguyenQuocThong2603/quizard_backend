import bcrypt from 'bcrypt';
import moment from 'moment';
import UserService from '../services/user.service.js';
import statusCode from '../constants/statusCode.js';

class AuthController {
  constructor(service) {
    this.service = service;
  }

  // async login(req, res) {

  // }

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
      return res.status(statusCode.BAD_REQUEST).json({ message: 'User already exists' });
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
