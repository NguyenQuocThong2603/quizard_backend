import moment from 'moment';
import UserService from './user.service.js';

const UserController = {

  async profile(req, res) {
    const { user } = req;
    const userProfile = await UserService.getProfile(user.id);
    return res.status(200).json(userProfile);
  },

  async editProfile(req, res) {
    const { user } = req;
    const { name, email, gender, dob } = req.body;
    if (!moment(dob, 'DD-MM-YYYY').isValid()) { return res.status(400).json({ message: 'Invalid date of birth' }); }
    if (gender !== 'Male' && gender !== 'Female') { return res.status(400).json({ message: 'Gender must be one of Male or Female' }); }
    const updatedUser = await UserService.updateProfile(user.id, {
      name,
      // email,
      gender,
      dob,
    });
    return res.status(200).json(updatedUser);
  },

  async logout(req, res) {
    const { user } = req;
    await UserService.deleteRefreshToken(user.email);
    return res.status(200).json({ message: 'Logout successfuly' });
  },
};

export default UserController;
