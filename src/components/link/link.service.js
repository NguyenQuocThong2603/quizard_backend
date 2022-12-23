import { nanoid } from 'nanoid';
import moment from 'moment';
import Link from './link.model.js';

const LinkService = {

  async createLink(group, fromUser) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    const url = nanoid(15);
    const newLink = Link({
      url,
      group,
      fromUser,
      expireDate,
    });
    return newLink.save();
  },

  async createForgotPasswordLink(email) {
    const expireDate = new Date(moment().add(1, 'h'));
    const url = nanoid(15);
    const newLink = Link({
      url,
      expireDate,
      toEmail: email,
    });
    return newLink.save();
  },

  async updateLinkStatus(url) {
    return Link.updateOne({
      url,
    }, { status: 'Invalid' });
  },

  async getLink(group, fromUser) {
    return Link.findOne({
      group,
      fromUser,
    }, { __v: 0, _id: 0 }).lean();
  },

  async findByUrl(url) {
    return Link.findOne({
      url,
    }, { __v: 0, _id: 0 }).lean();
  },
};

export default LinkService;
