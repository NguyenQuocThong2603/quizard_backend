import User from '../models/user.model.js';

class UserService {
  constructor(model) {
    this.model = model;
  }

  async getProfile(id) {
    const user = await this.model.findById(id, { email: 1, name: 1, gender: 1, dob: 1 });
    return user;
  }

  async findUser(email) {
    const user = await this.model.findOne({
      email,
    });
    return user;
  }

  async findUserByConfirmationCode(confirmationCode) {
    const user = await this.model.findOne({
      confirmationCode,
    });
    return user;
  }

  async findAllUsersInGroup(groupID) {
    const users = await this.model.find({
      joinedGroups: { $in: [groupID] },
    }, { password: 0, gender: 0, dob: 0, isVerified: 0, confirmationCode: 0, ownedGroups: 0, joinedGroups: 0 }).lean();
    return users;
  }

  async createUser(email, password, name, gender, dob, confirmationCode) {
    const newUser = await this.model({
      email,
      password,
      name,
      gender,
      dob,
      confirmationCode,
    });
    return newUser.save();
  }

  // update profile
  async updateProfile(id, data) {
    return this.model.findByIdAndUpdate(
      id,
      data,
      { new: true },
    );
  }

  async updateRefreshToken(email, refreshToken) {
    await this.model.updateOne({
      email,
    }, { refreshToken });
  }

  async deleteRefreshToken(email) {
    await this.model.updateOne({
      email,
    }, { $unset: { refreshToken: 1 } });
  }
}

export default new UserService(User);
