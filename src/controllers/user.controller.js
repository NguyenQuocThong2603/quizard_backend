import moment from 'moment';
import UserService from '../services/user.service.js';

class UserController {
  constructor(service) {
    this.service = service;
  }

  async profile(req, res) {
    console.log(req.user);
    return res.status(200).json(req.user);
  }

  async editProfile(req, res) {
    const { user } = req;
    const { name, email, gender, dob } = req.body;
    if (!moment(dob, 'DD-MM-YYYY').isValid()) { return res.status(400).json({ message: 'Invalid date of birth' }); }
    if (gender !== 'Male' && gender !== 'Female') { return res.status(400).json({ message: 'Gender must be one of Male or Female' }); }
    const updatedUser = await this.service.updateProfile(user._id, {
      name,
      // email,
      gender,
      dob,
    });
    return res.status(200).json(updatedUser);
  }

  async logout(req, res) {
    const { user } = req;
    await this.service.deleteRefreshToken(user.email);
    return res.status(200).json({ message: 'Logout successfuly' });
  }
}

export default new UserController(UserService);
