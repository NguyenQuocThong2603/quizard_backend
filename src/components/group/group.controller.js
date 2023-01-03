import { nanoid } from 'nanoid';
import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import GroupService from './group.service.js';
import UserService from '../user/user.service.js';
import LinkService from '../link/link.service.js';
import { sendInviteLink } from '../../config/nodemailer.js';
import SessionService from '../session/session.service.js';

const GroupController = {

  async list(req, res) {
    const { email } = req.user;
    const user = await UserService.findUser(email);
    const { category } = req.query;
    let groups = [];
    switch (category) {
      case 'all':
        groups = await UserService.getJoinedGroups(user);
        break;

      case 'owned':
        groups = await UserService.getOwnedGroups(user);
        break;

      case 'joined':
        const joinedGroups = await UserService.getJoinedGroups(user);
        const ownedGroups = await UserService.getOwnedGroups(user);
        groups = joinedGroups.filter(x => !(x in ownedGroups));
        // const setMap = new Map();
        // for (const group of ownedGroups.concat(joinedGroups)) setMap.set(group.groupId, group);
        // groups = [...setMap.values()];
        break;
    }
    return res.status(200).json({ groups });
  },

  async create(req, res) {
    const { name, description } = req.body;
    const { email: owner } = req.user;

    // create group
    let group;
    try {
      group = await GroupService.create(name, description, owner);

      // add user to joined groups & owned groups
      const user = await UserService.findUser(owner);
      user.joinedGroups.push(group.id);
      user.ownedGroups.push(group.id);
      user.save();
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }

    return res.status(statusCode.CREATED).json({ group });
  },

  async getDetail(req, res) {
    const { groupId } = req.params;
    try {
      const group = await GroupService.findGroupById(groupId);
      if (!group) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Group not found' });
      }
      let users = await UserService.findAllUsersInGroup(group.id);

      users = users.map(user => {
        const obj = user.toJSON();
        if (obj.email === group.owner) {
          obj.role = 'Owner';
        } else if ((_.findIndex(group.roles, role => role === obj.email) !== -1)) {
          obj.role = 'Co-Owner';
        } else {
          obj.role = 'Member';
        }
        return obj;
      });

      const groupDTO = {
        id: group.id,
        name: group.name,
        description: group.description,
        joinedUser: users,
      };
      return res.status(statusCode.OK).json({ group: groupDTO });
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

        const users = await UserService.findAllUsersInGroup(group.id);

        users.forEach(user => {
          if (user.email === group.owner) {
            user.role = 'Owner';
          } else if ((_.findIndex(group.roles, role => role === user.email) !== -1)) {
            user.role = 'Co-Owner';
          } else {
            user.role = 'Member';
          }
        });
        return res.status(statusCode.OK).json({ joinedUser: users });
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
        const users = await UserService.findAllUsersInGroup(group.id);

        users.forEach(user => {
          if (user.email === group.owner) {
            user.role = 'Owner';
          } else if ((_.findIndex(group.roles, role => role === user.email) !== -1)) {
            user.role = 'Co-Owner';
          } else {
            user.role = 'Member';
          }
        });
        return res.status(statusCode.OK).json({ joinedUser: users });
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

      kickedUser.joinedGroups = _.filter(kickedUser.joinedGroups, g => !g.equals(group.id));
      await kickedUser.save();

      const users = await UserService.findAllUsersInGroup(group.id);

      users.forEach(user => {
        if (user.email === group.owner) {
          user.role = 'Owner';
        } else if ((_.findIndex(group.roles, role => role === user.email) !== -1)) {
          user.role = 'Co-Owner';
        } else {
          user.role = 'Member';
        }
      });
      return res.status(statusCode.OK).json({ joinedUser: users });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async inviteByEmail(req, res) {
    const { email, link } = req.body;
    try {
      sendInviteLink(email, link);
      return res.status(statusCode.OK).send();
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async join(req, res) {
    const { url } = req.body;
    const link = await LinkService.findByUrl(url);
    const group = await GroupService.find(link.group);

    const { email } = req.user;
    const user = await UserService.findUser(email);
    if (user.joinedGroups.includes(link.group)) { return res.status(statusCode.OK).json({ groupId: group.groupId }); }

    user.joinedGroups.push(link.group);
    await user.save();
    return res.status(statusCode.OK).json({ groupId: group.id });
  },

  async deleteGroup(req, res) {
    try {
      const { user } = req;
      const { groupId } = req.params;
      const group = await GroupService.findGroupByIdAndDelete(groupId, user.email);
      if (!group) {
        return res.status(statusCode.FORBIDDEN).json({ message: 'Forbidden' });
      }
      await UserService.removeUserInJoinedGroup(group.id);
      await UserService.removeUserInOwnedGroup(group.id);
      return res.status(statusCode.OK).json({ message: 'Delete group succeed' });
    } catch (err) {
      console.log(err);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async getCurrentPresentation(req, res) {
    try {
      const { groupId } = req.query;
      const session = await SessionService.getLatestForGroup(groupId);
      if (!session || !session.presentationId.currentSession) res.status(statusCode.OK).json({ presentation: null });
      if (session.presentationId.currentSession.toString() == session._id.toString()) { return res.status(statusCode.OK).json({ presentation: session.presentationId }); }
      return res.status(statusCode.OK).json({ presentation: null });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  },

};

export default GroupController;
