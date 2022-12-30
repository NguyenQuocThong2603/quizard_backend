import { nanoid } from 'nanoid';
import moment from 'moment';
import Session from './session.model.js';

const SessionService = {

  async list(currentUser) {
    return Session.find({ hosts: currentUser });
  },

  async create(hosts, results, slideToResultMap) {
    const date = new Date();
    const newSession = Session({
      hosts,
      date,
      results,
      slideToResultMap
    });
    return newSession.save();
  },

  async createForgotPasswordSession(email) {
    const expireDate = new Date(moment().add(1, 'h'));
    const url = nanoid(15);
    const newSession = Session({
      url,
      expireDate,
      toEmail: email,
    });
    return newSession.save();
  },

  async updateSessionStatus(url) {
    return Session.updateOne({
      url,
    }, { status: 'Invalid' });
  },

  async getSession(group, fromUser) {
    return Session.findOne({
      group,
      fromUser,
    }, { __v: 0, _id: 0 }).lean();
  },

  async findByUrl(url) {
    return Session.findOne({
      url,
    }, { __v: 0, _id: 0 }).lean();
  },
};

export default SessionService;
