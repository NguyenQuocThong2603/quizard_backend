import GroupService from '../services/group.service.js';
import { nanoid } from 'nanoid';

class GroupController {
  constructor(service) {
    this.service = service;
  }

  async list(req, res) {
    const groups = await this.service.list();
    return res.status(200).json(groups);
  }

  async create(req, res) {
    const { name, description, owner } = req.body;

    // create group
    let group;
    try {
      const groupId = nanoid(10);
      group = await this.service.create(groupId, name, description, owner);
    } catch (err) {
      console.log(err);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }

    const groupDTO = {
      _id: group._id,
      groupId: group.groupId,
      name: group.name,
      description: group.description,
      owner: group.owner,
    };
    return res.status(statusCode.CREATED).json({ message: 'Create group successfully', group: groupDTO });
  }
}

export default new GroupController(GroupService);
