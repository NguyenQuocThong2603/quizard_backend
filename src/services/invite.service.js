import InviteLink from '../models/inviteLink.model.js';

class InviteService {
  constructor(model) {
    this.model = model;
  }

  async createLink(group, fromUser) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    const newLink = await this.model({
      group,
      fromUser,
      expireDate,
    });
    return newLink.save();
  }

  async getLink(group, fromUser) {
    return this.model.findOne({
      group,
      fromUser,
    }, { __v: 0, _id: 0 }).lean();
  }

  async findByUrl(url) {
    return this.model.findOne({
      url,
    }, { __v: 0, _id: 0 }).lean();
  }
}

export default new InviteService(InviteLink);
