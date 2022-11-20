import User from '../models/user.model.js';

class UserService {
  constructor(model) {
    this.model = model;
  }

  async findUser(email) {
    const user = await this.model.findOne({
      email,
    });
    return user;
  }

  async createUser(email, password, name, gender, dob) {
    const newUser = await this.model({
      email,
      password,
      name,
      gender,
      dob,
    });
    return newUser.save();
  }
}

export default new UserService(User);
