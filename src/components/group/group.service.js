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
      _id: groupId,
    });
    return group;
  },

  async list() {
    const groups = Group.find({});
    return groups;
  },

  async create(name, description, owner) {
    const newGroup = Group({
      name,
      description,
      owner,
    });
    return newGroup.save();
  },

  async findGroupByIdAndDelete(groupId, owner) {
    const group = Group.findOneAndDelete({
      _id: groupId, owner,
    }, { returnDocument: 'after' });
    return group;
  },

  async getSpecialMembers(_id) {
    const group = await Group.findOne({ _id });    
    return [group.owner, ...group.roles];
  },
};

export default GroupService;
