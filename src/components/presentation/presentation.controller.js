import _ from 'lodash';
import statusCode from '../../constants/statusCode.js';
import PresentationService from './presentation.service.js';
import UserService from '../user/user.service.js';
import SessionService from '../session/session.service.js';

const PresentationController = {

  async list(req, res) {
    const { groupId } = req.body;
    const presentations = await PresentationService.list(groupId);
    return res.status(statusCode.OK).json({ presentations });
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
    try {
      const { _id } = req.user;
      const { presentation, groupId } = req.body;
      let hosts;
      if (groupId) {
        // TODO: create session with co-hosts in group
      }
      else {
        hosts = [_id];
      }
      let results = presentation.slides.filter(slide => slide.type == slideTypes.multipleChoice);
      results = results.map(result => ({
        question: result.question,
        options: result.options.map(option => ({
          text: option.text,
          votes: []
        }))
      }));

      const newSession = await SessionService.create(hosts, results);
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
      const resultIndex = session.slideToResultMap[slideIndex];

      // push vote
      const newVote = { user: userId, date: new Date() }
      session.results[resultIndex].options[optionIndex].votes.push(newVote);
      await session.save();

      // respond current chart: [ {text: string, voteCount: int} ]
      const chart = session.results[resultIndex].options.map(option => ({
        text,
        voteCount: option.votes.length
      }))
      return res.status(statusCode.OK).json({ chart });

    } catch (error) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },
};

export default PresentationController;
