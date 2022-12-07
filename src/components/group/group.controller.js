import { nanoid } from 'nanoid';
import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import GroupService from './group.service.js';
import UserService from '../user/user.service.js';
import inviteService from '../invite/invite.service.js';
import { sendInviteLink } from '../../config/nodemailer.js';

const GroupController = {

  async list(req, res) {
    const { email } = req.user;
    const user = await UserService.findUser(email);
    const { category } = req.query;
    let groups = [];
    switch (category) {
      case 'all':
        const joinedGroups = await UserService.getJoinedGroups(user);
        const ownedGroups = await UserService.getOwnedGroups(user);
        const setMap = new Map();
        for (const group of ownedGroups.concat(joinedGroups)) setMap.set(group.groupId, group);
        groups = [...setMap.values()];
        break;

      case 'owned':
        groups = await UserService.getOwnedGroups(user);
        break;

      case 'joined':
        groups = await UserService.getJoinedGroups(user);
        break;
    }
    // const groups = await GroupService.list();
    return res.status(200).json(groups);
  },

  async create(req, res) {
    const { name, description } = req.body;
    const { email: owner } = req.user;

    // create group
    let group;
    try {
      const groupId = nanoid(10);
      group = await GroupService.create(groupId, name, description, owner);

      // add user to joined groups & owned groups
      const user = await UserService.findUser(owner);
      user.joinedGroups.push(group._id);
      user.ownedGroups.push(group._id);
      user.save();
    } catch (err) {
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
  },

  async getDetail(req, res) {
    const { groupId } = req.params;
    try {
      const group = await GroupService.findGroupById(groupId);
      if (!group) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Group not found' });
      }
      const users = await UserService.findAllUsersInGroup(group._id);

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
  },

  async changeRole(req, res) {
    const { roleWantToChange, groupId, email } = req.body;
    if (roleWantToChange === 'Member') {
      try {
        const group = await GroupService.findGroupById(groupId);
        if (!group) {
          return res.status(statusCode.NOT_FOUND).json({ message: 'Group not found' });
        }
        group.roles = _.difference(group.roles, [email]);
        await group.save();

        const users = await UserService.findAllUsersInGroup(group._id);

        users.forEach(user => {
          if (user.email === group.owner) {
            user.role = 'Owner';
          } else if ((_.findIndex(group.roles, role => role === user.email) !== -1)) {
            user.role = 'Co-Owner';
          } else {
            user.role = 'Member';
          }
        });
        return res.status(statusCode.OK).json({ message: 'Change role successfully', joinedUser: users });
      } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
      }
    } else {
      try {
        const group = await GroupService.findGroupById(groupId);
        if (!group) {
          return res.status(statusCode.NOT_FOUND).json({ message: 'Group not found' });
        }
        group.roles.push(email);
        await group.save();
        const users = await UserService.findAllUsersInGroup(group._id);

        users.forEach(user => {
          if (user.email === group.owner) {
            user.role = 'Owner';
          } else if ((_.findIndex(group.roles, role => role === user.email) !== -1)) {
            user.role = 'Co-Owner';
          } else {
            user.role = 'Member';
          }
        });
        return res.status(statusCode.OK).json({ message: 'Change role successfully', joinedUser: users });
      } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
      }
    }
  },

  async kickUser(req, res) {
    const { email, groupId } = req.body;
    try {
      const kickedUser = await UserService.findUser(email);

      if (!kickedUser) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'User not found' });
      }
      const group = await GroupService.findGroupById(groupId);
      if (!group) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Group not found' });
      }

      kickedUser.joinedGroups = _.filter(kickedUser.joinedGroups, g => !g.equals(group._id));
      await kickedUser.save();

      const users = await UserService.findAllUsersInGroup(group._id);

      users.forEach(user => {
        if (user.email === group.owner) {
          user.role = 'Owner';
        } else if ((_.findIndex(group.roles, role => role === user.email) !== -1)) {
          user.role = 'Co-Owner';
        } else {
          user.role = 'Member';
        }
      });
      return res.status(statusCode.OK).json({ message: 'Kick user successfully', joinedUser: users });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async inviteByEmail(req, res) {
    const { email, link } = req.body;
    try {
      sendInviteLink(email, link);
      return res.status(statusCode.OK).json({ message: 'Invite successfully' });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async join(req, res) {
    const { url } = req.body;
    const link = await inviteService.findByUrl(url);
    const group = await GroupService.find(link.group);

    const { email } = req.user;
    const user = await UserService.findUser(email);
    if (user.joinedGroups.includes(link.group)) { return res.status(statusCode.OK).json({ message: 'Group already joined', groupId: group.groupId }); }

    user.joinedGroups.push(link.group);
    user.save();
    return res.status(statusCode.OK).json({ message: 'Group joined', groupId: group.groupId });
  },
};

export default GroupController;