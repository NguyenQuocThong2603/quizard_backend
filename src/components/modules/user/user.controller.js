import UserService from './user.service.js';

class UserController {
  constructor(service) {
    this.service = service;
  }

  async login(req, res) {
  }
}

export default new UserController(UserService);
