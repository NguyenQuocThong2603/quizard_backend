import Group from './group.model.js';

const GroupService = {

  async find(_id) {
    const group = await Group.findOne({
      _id,
    });
    return group;
  },

  async findGroupById(groupId) {
    const group = await Group.findOne({
      groupId,
    });
    return group;
  },

  async list() {
    const groups = await Group.find({}).lean();
    return groups;
  },

  async create(groupId, name, description, owner) {
    const newGroup = await Group({
      groupId,
      name,
      description,
      owner,
    });
    return newGroup.save();
  },
};

export default GroupService;
