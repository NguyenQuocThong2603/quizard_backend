import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import PresentationService from './presentation.service.js';
import UserService from '../user/user.service.js';

const PresentationController = {

  async getPresentations(req, res) {
    try {
      const { user } = req;
      const { category } = req.query;
      let presentations;
      if (category === 'owned') {
        presentations = await PresentationService.getOwnedPresentations(user._id);
      } else {
        presentations = await PresentationService.getCollaboratePresentations(user._id);
      }
      const presentationDTO = [];
      presentations.forEach(presentation => {
        const { _id, ...informOfPresentation } = presentation;
        presentationDTO.push({
          id: _id,
          ...informOfPresentation,
        });
      });
      return res.status(statusCode.OK).json({ presentations: presentationDTO });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  },

  async create(req, res) {
    const { _id: owner } = req.user;

    // count number of name-unedited presentations
    const defaultName = 'New presentation';
    const newPresentationCount = await PresentationService.countNewPrensentation(defaultName);
    const name = `${defaultName} (${newPresentationCount})`;

    // create presentation
    let presentation;
    try {
      presentation = await PresentationService.create(name, owner);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
    return res.status(statusCode.CREATED).json({ presentation });
  },

  async delete(req, res) {
    const { id } = req.body;
    try {
      await PresentationService.delete(id);
      return res.status(statusCode.OK).json();
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

  async getCollaborators(req, res) {
    try {
      const { presentationId } = req.query;
      const presentation = await PresentationService.getCollaborators(presentationId);
      if (!presentation) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Not found' });
      }
      const collaborators = presentation.collaborators.map(collaborator => {
        const { _id, ...information } = collaborator;
        return {
          id: _id,
          ...information,
        };
      });
      return res.status(statusCode.OK).json({ collaborators });
    } catch (error) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async addCollaborator(req, res) {
    try {
      const { presentationId, email } = req.body;
      const presentation = await PresentationService.find(presentationId);
      if (!presentation) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Not found' });
      }
      const user = await UserService.findUser(email);

      if (!user) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'User not found' });
      }

      if (user._id.toString() === presentation.owner.toString()) {
        return res.status(statusCode.CONFLICT);
      }

      if (presentation.collaborators.some(collaborator => collaborator._id.toString() === user._id.toString())) {
        return res.status(statusCode.BAD_REQUEST).json({ mesage: 'Email exists' });
      }
      presentation.collaborators.push(user._id);
      await presentation.save();
      const userDTO = {
        id: user._id,
        email: user.email,
        name: user.name,
      };
      return res.status(statusCode.OK).json({ user: userDTO });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  },
  async deleteCollaborator(req, res) {
    try {
      const { presentationId, collaboratorId } = req.body;

      const presentation = await PresentationService.findPresentationAndCollaborators(presentationId);
      if (!presentation) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Not found' });
      }
      const findCollaborator = presentation.collaborators
        .find(collaborator => collaboratorId === collaborator._id.toString());
      if (!findCollaborator) {
        return res.status(statusCode.BAD_REQUEST).json({ mesage: 'Collaborator does not exist' });
      }
      presentation.collaborators = presentation.collaborators
        .filter(collaborator => findCollaborator._id !== collaborator._id);
      await presentation.save();
      const updatedPresentation = await PresentationService.getCollaborators(presentationId);
      const collaborators = updatedPresentation.collaborators.map(collaborator => {
        const { _id, ...information } = collaborator;
        return {
          id: _id,
          ...information,
        };
      });
      return res.status(statusCode.OK).json({ collaborators });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  },
};

export default PresentationController;
