import Session from './session.model.js';

const SessionService = {  

  async list(currentUser) {
    return Session.find({ hosts: currentUser });
  },

  async find(id) {
    return Session.findOne({ _id: id });
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

  async getChartData(session, resultIndex) {
    return session.results[resultIndex].options.map(option => ({
      text: option.text,
      voteCount: option.votes.length
    }));
  }
};

export default SessionService;
