import { nanoid } from 'nanoid';
import _ from 'lodash';
import statusCode from '../constants/statusCode.js';
import GroupService from '../services/group.service.js';
import UserService from '../services/user.service.js';

class GroupController {
  constructor(userService, groupService) {
    this.userService = userService;
    this.groupService = groupService;
  }

  async list(req, res) {
    const groups = await this.groupService.list();
    return res.status(200).json(groups);
  }

  async create(req, res) {
    const { name, description, owner } = req.body;

    // create group
    let group;
    try {
      const groupId = nanoid(10);
      group = await this.groupService.create(groupId, name, description, owner);
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

  async getDetail(req, res) {
    const { groupId } = req.params;
    try {
      const group = await this.groupService.findGroupById(groupId);
      if (!group) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Not found' });
      }
      const users = await this.userService.findAllUsersInGroup(group._id);

      users.forEach(user => {
        if (user.email === group.owner) {
          user.role = 'Owner';
        } else if ((_.findIndex(group.roles, role => role === user.email) !== -1)) {
          user.role = 'Co-Owner';
        } else {
          user.role = 'Member';
        }
      });
      const groupDTO = {
        _id: group._id,
        groupId: group.groupId,
        name: group.name,
        description: group.description,
        joinedUser: users,
      };
      return res.status(statusCode.OK).json(groupDTO);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  }

  async changeRole(req, res) {
    const { roleWantToChange, groupId, userEmail } = req.body;
    if (roleWantToChange === 'Member') {
      try {
        const group = await this.groupService.findGroupById(groupId);
        if (!group) {
          return res.status(statusCode.NOT_FOUND).json({ message: 'Not found' });
        }
        group.roles = _.difference(group.roles, [userEmail]);
        console.log(group);
        await group.save();
        return res.status(statusCode.OK).json({ message: 'Change role successfully', group });
      } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
      }
    } else {
      try {
        const group = await this.groupService.findGroupById(groupId);
        if (!group) {
          return res.status(statusCode.NOT_FOUND).json({ message: 'Not found' });
        }
        group.roles.push(userEmail);
        await group.save();
        return res.status(statusCode.OK).json({ message: 'Change role successfully', group });
      } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
      }
    }
  }
}

export default new GroupController(UserService, GroupService);
