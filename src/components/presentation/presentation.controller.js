import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import PresentationService from './presentation.service.js';
import UserService from '../user/user.service.js';
import SessionService from '../session/session.service.js';
import slideTypes from '../../constants/slideTypes.js';

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
    try {
      const { presentation, groupId } = req.body;
      if (presentation.currentSession != null) return res.status(statusCode.OK).send();

      
      // hosts array (host: can control presentation)
      const { _id } = req.user;
      let hosts;
      if (groupId) {
        // TODO: create with co-hosts
      }
      else hosts = [_id];

      // filter multiple choice slides
      let results = presentation.slides.filter(slide => slide.type == slideTypes.multipleChoice);

      // slide index to result index map
      const slideToResultMap = {};
      results.forEach((result, resultIndex) => {
        const slideIndex = presentation.slides.indexOf(result);
        slideToResultMap[slideIndex] = resultIndex;
      });

      // convert from slide to result
      results = results.map(result => ({
        question: result.question,
        options: result.options.map(option => ({
          text: option,
          votes: []
        }))
      }));

      const newSession = await SessionService.create(hosts, results, slideToResultMap);
      await PresentationService.updateCurrentSlideIndex(presentation.id, 0);
      await PresentationService.updateCurrentSession(presentation.id, newSession);
      return res.status(statusCode.OK).send();

    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async getCurrentSession(req, res) {
    const { presentationId } = req.params;
    const presentation = await PresentationService.find(presentationId).populate("currentSession");
    const session = presentation.currentSession;
    return res.status(statusCode.OK).json({ session });
  },

  async join(req, res) {
    try {
      const { id } = req.body;
      // TODO: check for user in the group
      const presentation = await PresentationService.find(id);
      const slideIndex = presentation.currentSlideIndex;
      const slides = presentation.slides;
      return res.status(statusCode.OK).json({ slides, slideIndex });

    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async vote(req, res) {
    try {
      // get info
      const { _id: userId } = req.user;
      const { id, slideIndex, optionIndex } = req.body;
      const presentation = await PresentationService.find(id);
      const session = await SessionService.find(presentation.currentSession);
      const resultIndex = session.slideToResultMap[`${slideIndex}`];

      // push vote
      const newVote = { user: userId, date: new Date() }
      session.results[resultIndex].options[optionIndex].votes.push(newVote);
      await session.save();

      // respond current chart: [ {text: string, voteCount: int} ]
      const chart = await SessionService.getChartData(session, resultIndex);

      return res.status(statusCode.OK).json({ chart });
    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async getChartData(req, res) {
    try {
      // get info
      const { sessionId, slideIndex } = req.query;
      const session = await SessionService.find(sessionId);
      const resultIndex = session.slideToResultMap[`${slideIndex}`];

      // respond current chart: [ {text: string, voteCount: int} ]
      const chart = await SessionService.getChartData(session, resultIndex);
      
      return res.status(statusCode.OK).json({ chart });
    } catch (error) {
      console.log(error);
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
