import User from '../../../models/user.model.js';

class UserService {
  constructor(model) {
    this.model = model;
  }

  async findUser(username) {
    const user = await this.model.findOne({
      username,
    });
    return user;
  }
}

export default new UserService(User);
