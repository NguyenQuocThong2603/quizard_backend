import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import PresentationService from './presentation.service.js';
import UserService from '../user/user.service.js';

const PresentationController = {

  async list(req, res) {
    const { groupId } = req.body;
    const presentations = await PresentationService.list(groupId);
    return res.status(statusCode.OK).json(presentations);
  },

  async create(req, res) {
    const { groupId: group } = req.body;
    const { _id: owner } = req.user;

    // count number of name-unedited presentations
    const defaultName = "New presentation";
    const newPresentationCount = await PresentationService.countNewPrensentation(defaultName);
    const name = `${defaultName} (${newPresentationCount})`;

    // create presentation
    let presentation;
    try {
      console.log(group);
      presentation = await PresentationService.create(name, owner, group);
    } catch (err) {
      console.log(err);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
    return res.status(statusCode.CREATED).json(presentation);
  },

  async delete(req, res) {
    console.log(req.body);
    const { _id } = req.body;
    console.log(_id);
    try {
      const result = await PresentationService.delete(_id);
      return res.status(statusCode.OK).json(result);      
    } catch (error) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json(err);
    }
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
  async saveListSlide(req, res) {
    const { presentationId, listSlide } = req.body;
    try {
      const presentation = await PresentationService.find(presentationId);
      if (!presentation) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Presentation not found' });
      }
      presentation.slides = listSlide;
      presentation.modified = Date.now();
      await presentation.save();
      return res.status(statusCode.OK).json({ message: 'Save list slide successfully', presentation });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },
};

export default PresentationController;
