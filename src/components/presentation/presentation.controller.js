import { nanoid } from 'nanoid';
import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import PresentationService from '../presentation/presentation.service.js';
import UserService from '../user/user.service.js';
import inviteService from '../invite/invite.service.js';
import { sendInviteLink } from '../../config/nodemailer.js';

const PresentationController = {

  async list(req, res) {
    const { groupId } = req.body;
    const presentations = await PresentationService.list(groupId);
    return res.status(200).json(presentations);
  },

  async create(req, res) {
    const { groupId } = req.body;
    const { _id: owner } = req.user;

    // count number of name-unedited presentations
    const defaultName = "New presentation";
    const newPresentationCount = await PresentationService.CountNewPrensentation(defaultName);
    const name = `${defaultName} (${newPresentationCount})`;
    
    // create presentation
    let presentation;
    try {
      presentation = await PresentationService.create(name, owner, groupId);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
    return res.status(statusCode.CREATED).json(presentation);
  },

  async getDetail(req, res) {
    const { presentationId } = req.params;
    try {
      const presentation = await PresentationService.findPresentationById(presentationId);
      if (!presentation) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Presentation not found' });
      }
      const users = await UserService.findAllUsersInPresentation(presentation._id);

      users.forEach(user => {
        if (user.email === presentation.owner) {
          user.role = 'Owner';
        } else if ((_.findIndex(presentation.roles, role => role === user.email) !== -1)) {
          user.role = 'Co-Owner';
        } else {
          user.role = 'Member';
        }
      });
      const presentationDTO = {
        _id: presentation._id,
        presentationId: presentation.presentationId,
        name: presentation.name,
        description: presentation.description,
        joinedUser: users,
      };
      return res.status(statusCode.OK).json(presentationDTO);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async changeRole(req, res) {
    const { roleWantToChange, presentationId, email } = req.body;
    if (roleWantToChange === 'Member') {
      try {
        const presentation = await PresentationService.findPresentationById(presentationId);
        if (!presentation) {
          return res.status(statusCode.NOT_FOUND).json({ message: 'Presentation not found' });
        }
        presentation.roles = _.difference(presentation.roles, [email]);
        await presentation.save();

        const users = await UserService.findAllUsersInPresentation(presentation._id);

        users.forEach(user => {
          if (user.email === presentation.owner) {
            user.role = 'Owner';
          } else if ((_.findIndex(presentation.roles, role => role === user.email) !== -1)) {
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
        const presentation = await PresentationService.findPresentationById(presentationId);
        if (!presentation) {
          return res.status(statusCode.NOT_FOUND).json({ message: 'Presentation not found' });
        }
        presentation.roles.push(email);
        await presentation.save();
        const users = await UserService.findAllUsersInPresentation(presentation._id);

        users.forEach(user => {
          if (user.email === presentation.owner) {
            user.role = 'Owner';
          } else if ((_.findIndex(presentation.roles, role => role === user.email) !== -1)) {
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
    const { email, presentationId } = req.body;
    try {
      const kickedUser = await UserService.findUser(email);

      if (!kickedUser) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'User not found' });
      }
      const presentation = await PresentationService.findPresentationById(presentationId);
      if (!presentation) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Presentation not found' });
      }

      kickedUser.joinedPresentations = _.filter(kickedUser.joinedPresentations, g => !g.equals(presentation._id));
      await kickedUser.save();

      const users = await UserService.findAllUsersInPresentation(presentation._id);

      users.forEach(user => {
        if (user.email === presentation.owner) {
          user.role = 'Owner';
        } else if ((_.findIndex(presentation.roles, role => role === user.email) !== -1)) {
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
    const presentation = await PresentationService.find(link.presentation);

    const { email } = req.user;
    const user = await UserService.findUser(email);
    if (user.joinedPresentations.includes(link.presentation)) { return res.status(statusCode.OK).json({ message: 'Presentation already joined', presentationId: presentation.presentationId }); }

    user.joinedPresentations.push(link.presentation);
    user.save();
    return res.status(statusCode.OK).json({ message: 'Presentation joined', presentationId: presentation.presentationId });
  },
};

export default PresentationController;
