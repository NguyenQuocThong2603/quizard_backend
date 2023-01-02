import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import PresentationService from './presentation.service.js';
import UserService from '../user/user.service.js';
import SessionService from '../session/session.service.js';
import slideTypes from '../../constants/slideTypes.js';
import io from '../socket/server.js';
import socketEvents from '../../constants/socketEvents.js';

const PresentationController = {

  async getPresentations(req, res) {
    try {
      const { user } = req;
      console.log(user);
      const { category } = req.query;
      let presentations;
      if (category === 'owned') {
        presentations = await PresentationService.getOwnedPresentations(user.id);
      } else {
        presentations = await PresentationService.getCollaboratePresentations(user.id);
      }
      return res.status(statusCode.OK).json({ presentations });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  },

  async create(req, res) {
    const { id: owner } = req.user;

    // count number of name-unedited presentations
    const defaultName = 'New presentation';
    const newPresentationCount = await PresentationService.countNewPrensentation(defaultName);
    const name = `${defaultName} (${newPresentationCount})`;

    // create presentation
    let presentation;
    try {
      presentation = await PresentationService.create(name, owner);
      return res.status(statusCode.CREATED).json({ presentation });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
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
      presentationInDB.type = presentation.type;
      presentationInDB.header = presentation.header;
      presentationInDB.content = presentation.content;
      presentationInDB.modified = Date.now();
      await presentationInDB.save();
      return res.status(statusCode.OK).json({ presentation });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: er.mesage });
    }
  },

  async live(req, res) {
    try {
      const { presentation, groupId } = req.body;
      if (presentation.currentSession != null) return res.status(statusCode.OK).send();

      // hosts array (host: can control presentation)
      const { email } = req.user;
      let hosts;
      if (groupId) {
        // TODO: create with co-hosts
<<<<<<< HEAD
      } else hosts = [_id];
=======
      }
      else hosts = [email];
>>>>>>> development

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
          votes: [],
        })),
      }));

      const newSession = await SessionService.create(hosts, presentation.id, results, slideToResultMap);
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
    const presentation = await PresentationService.find(presentationId).populate('currentSession');
    const session = presentation.currentSession;
    return res.status(statusCode.OK).json({ session });
  },

  async join(req, res) {
    try {
      const { email } = req.user;
      const { id } = req.body;
      // TODO: check for user in the group
      const presentation = await PresentationService.find(id);
<<<<<<< HEAD
      const slideIndex = presentation.currentSlideIndex;
      const { slides } = presentation;
      return res.status(statusCode.OK).json({ slides, slideIndex });
=======
      const isHost = await SessionService.checkIsHost(email, presentation.currentSession);

      return res.status(statusCode.OK).json({ presentation, isHost });

    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async end(req, res) {
    try {
      const { id } = req.body;
      const presentation = await PresentationService.find(id);
      presentation.currentSession = null;
      presentation.save();
      return res.status(statusCode.OK).send();

>>>>>>> development
    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async updateSlideIndex(req, res) {
    try {
      const { id, slideIndex } = req.body;
      await PresentationService.updateCurrentSlideIndex(id, slideIndex);
      io.in(id).emit(socketEvents.slideChange, slideIndex);
      return res.status(statusCode.OK).send();
    } catch (error) {
      console.log(error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

  async vote(req, res) {
    try {
      // get info
      const { id: userId } = req.user;
      const { id, slideIndex, optionIndex } = req.body;
      const presentation = await PresentationService.find(id);
      const session = await SessionService.find(presentation.currentSession);
      const resultIndex = session.slideToResultMap[`${slideIndex}`];

      // push vote
      const newVote = { user: userId, date: new Date() };
      session.results[resultIndex].options[optionIndex].votes.push(newVote);
      await session.save();

      // respond current chart: [ {text: string, voteCount: int} ]
      const chart = await SessionService.getChartData(session, resultIndex);
      io.in(id).emit(socketEvents.voteChange, slideIndex, optionIndex);

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

  async getLatestChartData(req, res) {
    try {
      // get info
      const { id, slideIndex } = req.query;
      const session = await SessionService.findLatestForPresentation(id);
      if (!session) return res.status(statusCode.OK).json({ chart: null });

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
      const presentationDTO = {
        name: presentation.name,
        collaborators,
      };
      return res.status(statusCode.OK).json({ presentation: presentationDTO });
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

      if (user.id.toString() === presentation.owner.toString()) {
        return res.status(statusCode.CONFLICT);
      }

      if (presentation.collaborators.some(collaborator => collaborator.id.toString() === user.id.toString())) {
        return res.status(statusCode.BAD_REQUEST).json({ mesage: 'Email exists' });
      }
      presentation.collaborators.push(user.id);
      await presentation.save();
      return res.status(statusCode.OK).json({ user });
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
        .find(collaborator => collaboratorId === collaborator.id.toString());
      if (!findCollaborator) {
        return res.status(statusCode.BAD_REQUEST).json({ mesage: 'Collaborator does not exist' });
      }
      presentation.collaborators = presentation.collaborators
        .filter(collaborator => findCollaborator.id !== collaborator.id);
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
