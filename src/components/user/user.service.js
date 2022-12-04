import User from './user.model.js';

const UserService = {

  async getProfile(id) {
    const user = await User.findById(id, { email: 1, name: 1, gender: 1, dob: 1 });
    return user;
  },

  async findUser(email) {
    const user = await User.findOne({
      email,
    });
    return user;
  },

  async findUserByConfirmationCode(confirmationCode) {
    const user = await User.findOne({
      confirmationCode,
    });
    return user;
  },

  async findAllUsersInGroup(groupID) {
    const users = await User.find({
      joinedGroups: { $in: [groupID] },
    }, { password: 0, gender: 0, dob: 0, isVerified: 0, confirmationCode: 0, ownedGroups: 0, joinedGroups: 0 }).lean();
    return users;
  },

  async createUser(email, password, name, gender, dob, confirmationCode) {
    const newUser = await User({
      email,
      password,
      name,
      gender,
      dob,
      confirmationCode,
    });
    return newUser.save();
  },

  // update profile
  async updateProfile(id, data) {
    return User.findByIdAndUpdate(
      id,
      data,
      { new: true },
    );
  },

  async updateRefreshToken(email, refreshToken) {
    await User.updateOne({
      email,
    }, { refreshToken });
  },

  async deleteRefreshToken(email) {
    await User.updateOne({
      email,
    }, { $unset: { refreshToken: 1 } });
  },

  async getJoinedGroups(user) {
    await user.populate('joinedGroups');
    return user.joinedGroups;
  },

  async getOwnedGroups(user) {
    await user.populate('ownedGroups');
    return user.ownedGroups;
  },
};

export default UserService;
