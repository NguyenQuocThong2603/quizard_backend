import Session from './session.model.js';

const SessionService = {

  async list(userEmail) {
    return Session.find({ hosts: userEmail })
      .select(['_id', 'presentationId', 'date', 'presentationName']);
  },

  async checkIsHost(email, sessionId) {
    const count = await Session.countDocuments({ _id: sessionId, hosts: email });
    return count == 1;
  },

  async find(id) {
    return Session.findOne({ _id: id });
  },

  async findLatestForPresentation(presentationId) {
    return Session.findOne({ presentationId });
  },

  async create(hosts, presentationId, presentationName, groupId, results, slideToResultMap) {
    const date = new Date();
    const newSession = Session({
      hosts,
      presentationId,
      presentationName,
      groupId,
      date,
      results,
      slideToResultMap,
    });
    return newSession.save();
  },

  async getChartData(session, resultIndex) {
    return session.results[resultIndex].options.map(option => ({
      text: option.text,
      voteCount: option.votes.length,
    }));
  },

  async getQuestionOfSession(id) {
    return Session.findOne({ _id: id }).select(['presentationId', 'questions']);
  },

  async getResultOfSession(id) {
    return Session.findOne({ _id: id }).select('results').populate('results.options.votes.user', ['name', 'email']);
  },

  async getChatOfSession(sessionId) {
    return Session.findOne({ _id: sessionId }).select('chats').populate('chats.user', ['name', 'email']);
  },

  async getLatestForGroup(groupId) {
    return Session.findOne({ groupId }).sort({ date: -1 }).populate(['presentationId', 'groupId']);
  },
};

export default SessionService;
