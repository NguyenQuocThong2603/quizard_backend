import InviteLink from '../models/inviteLink.model.js';

class InviteService {
  constructor(model) {
    this.model = model;
  }

  async createLink(group, fromUser) {
    let expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    const newLink = await this.model({
      group,
      fromUser,
      expireDate
    });
    return newLink.save();
  }
}

export default new InviteService(InviteLink);
