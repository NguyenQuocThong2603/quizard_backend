import { nanoid } from 'nanoid';
import InviteLink from '../invite/inviteLink.model.js';

const InviteService = {

  async createLink(group, fromUser) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    const url = nanoid(15);
    const newLink = await InviteLink({
      url,
      group,
      fromUser,
      expireDate,
    });
    return newLink.save();
  },

  async getLink(group, fromUser) {
    return InviteLink.findOne({
      group,
      fromUser,
    }, { __v: 0, _id: 0 }).lean();
  },

  async findByUrl(url) {
    return InviteLink.findOne({
      url,
    }, { __v: 0, _id: 0 }).lean();
  },
};

export default InviteService;
