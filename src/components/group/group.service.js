import Group from './group.model.js';

const GroupService = {

  async find(_id) {
    const group = Group.findOne({
      _id,
    });
    return group;
  },

  async findGroupById(groupId) {
    const group = Group.findOne({
      groupId,
    });
    return group;
  },

  async list() {
    const groups = Group.find({});
    return groups;
  },

  async create(groupId, name, description, owner) {
    const newGroup = Group({
      groupId,
      name,
      description,
      owner,
    });
    return newGroup.save();
  },

  async findGroupByIdAndDelete(groupId, owner) {
    const group = Group.findOneAndDelete({
      groupId, owner,
    }, { returnDocument: 'after' });
    return group;
  },
};

export default GroupService;
