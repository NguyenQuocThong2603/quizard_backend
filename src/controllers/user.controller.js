import UserService from '../services/user.service.js';

class UserController {
  constructor(service) {
    this.service = service;
  }

  async profile(req, res) {
    console.log(req.user);
    return res.status(200).json(req.user);
  }

  async logout(req, res) {
    const { user } = req;
    await this.service.deleteRefreshToken(user.email);
    return res.status(200).json({ message: 'Logout successfuly' });
  }
}

export default new UserController(UserService);
