import Group from '../models/group.model.js';

class GroupService {
  constructor(model) {
    this.model = model;
  }

  async find(_id) {
    const group = await this.model.findOne({
      _id
    });
    return group;
  }

  async findGroupById(groupId) {
    const group = await this.model.findOne({
      groupId,
    });
    return group;
  }

  async list() {
    const groups = await this.model.find({}).lean();
    return groups;
  }

  async create(groupId, name, description, owner) {
    const newGroup = await this.model({
      groupId,
      name,
      description,
      owner,
    });
    return newGroup.save();
  }
}

export default new GroupService(Group);
