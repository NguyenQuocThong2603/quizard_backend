import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import PresentationService from './presentation.service.js';
import UserService from '../user/user.service.js';

const PresentationController = {

  async list(req, res) {
    const { groupId } = req.body;
    const presentations = await PresentationService.list(groupId);
    return res.status(statusCode.OK).json({ presentations });
  },

  async create(req, res) {
    const { groupId: group } = req.body;
    const { _id: owner } = req.user;

    // count number of name-unedited presentations
    const defaultName = 'New presentation';
    const newPresentationCount = await PresentationService.countNewPrensentation(defaultName);
    const name = `${defaultName} (${newPresentationCount})`;

    // create presentation
    let presentation;
    try {
      presentation = await PresentationService.create(name, owner, group);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
    return res.status(statusCode.CREATED).json({ presentation });
  },

  async delete(req, res) {
    const { _id } = req.body;
    console.log(req.body);
    try {
      await PresentationService.delete(_id);
      return res.status(statusCode.OK).send();
    } catch (error) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async getDetail(req, res) {
    const { presentationId } = req.params;
    try {
      const presentation = await PresentationService.find(presentationId);
      if (!presentation) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Presentation not found' });
      }
      return res.status(statusCode.OK).json({ presentation });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async save(req, res) {
    const { presentation } = req.body;
    try {
      const presentationInDB = await PresentationService.find(presentation.id);
      if (!presentationInDB) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Presentation not found' });
      }
      presentationInDB.question = presentation.question;
      presentationInDB.name = presentation.name;
      presentationInDB.slides = presentation.slides;
      presentationInDB.modified = Date.now();
      await presentationInDB.save();
      return res.status(statusCode.OK).json({ presentation });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async live(req, res) {
    const { id } = req.body;
    try {
      const presentation = await PresentationService.find(id);
      presentation.isLive = true;
      await presentation.save();
      return res.status(statusCode.OK).json({ presentation });

    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async join(req, res) {
    const { id } = req.body;
    // TODO: check for user in the group
    try {
      const presentation = await PresentationService.find(id);
      const slideIndex = presentation.currentSlideIndex;
      const slide = presentation.slides[slideIndex];
      return res.status(statusCode.OK).json({ slide, slideIndex });

    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async choose(req, res) {
    const { id, slideIndex, optionIndex } = req.body;
    // TODO: check for user in the group
    try {
      const presentation = await PresentationService.find(id);
      presentation.slides[slideIndex].options[optionIndex].vote += 1;
      await presentation.save();
      const slide = presentation.slides[slideIndex];
      return res.status(statusCode.OK).json({ slide });

    } catch (error) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },
};

export default PresentationController;
