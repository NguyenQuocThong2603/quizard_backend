import Vote from './Vote.model.js';

const VoteService = {

  async list(currentUser) {
    return Vote.find({ hosts: currentUser }).select(['_id', 'presentationId', 'date']).populate('presentationId', ['name']).lean();
  },

  async checkIsHost(email, VoteId) {
    const count = await Vote.countDocuments({ _id: VoteId, hosts: email });
    return count == 1;
  },

  async find(id) {
    return Vote.findOne({ _id: id });
  },

  async findLatestForPresentation(presentationId) {
    return Vote.findOne({ presentationId });
  },

  async create(hosts, presentationId, results, slideToResultMap) {
    const date = new Date();
    const newVote = Vote({
      hosts,
      presentationId,
      date,
      results,
      slideToResultMap,
    });
    return newVote.save();
  },
};

export default VoteService;
