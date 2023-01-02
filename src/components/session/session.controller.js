import GroupService from '../group/group.service.js';
import statusCode from '../../constants/statusCode.js';
import SessionService from './session.service.js';
import slideTypes from '../../constants/slideTypes.js';
import PresentationService from '../presentation/presentation.service.js';

const SessionController = {

  async list(req, res) {
    try {
      const { user } = req;
      const sessions = await SessionService.list(user._id);
      const sessionsDTO = sessions.map(session => {
        const { _id, ...information } = session;
        return {
          id: _id,
          ...information,
        };
      });
      return res.status(statusCode.OK).json({ sessions: sessionsDTO });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  },

  async getQuestions(req, res) {
    try {
      const { sessionId } = req.query;
      const session = await SessionService.getQuestionOfSession(sessionId);
      return res.status(statusCode.OK).json({ questions: session.questions });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  },

  async getResults(req, res) {
    try {
      const { sessionId } = req.query;
      const session = await SessionService.getResultOfSession(sessionId);
      return res.status(statusCode.OK).json({ results: session.results });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  },
  // async create(req, res) {
  //   const { id } = req.user;
  //   const { presentation, groupId } = req.body;
  //   let hosts;
  //   if (groupId) {
  //     // create with co-hosts
  //   }
  //   else {
  //     hosts = [_id];
  //   }
  //   // filter multiple choice slides
  //   let results = presentation.slides.filter(slide => slide.type == slideTypes.multipleChoice);

  //   // slide index to result index map
  //   const slideToResultMap = {};
  //   results.forEach((result, resultIndex) => {
  //     const slideIndex = presentation.slides.indexOf(result);
  //     slideToResultMap[slideIndex] = resultIndex;
  //   });
  //   console.log(slideToResultMap);

  //   // convert from slide to result
  //   results = results.map(result => ({
  //     question: result.question,
  //     options: result.options.map(option => ({
  //       text: option.text,
  //       votes: []
  //     }))
  //   }));

  //   await SessionService.create(hosts, results, slideToResultMap);
  //   return res.status(statusCode.OK).send();
  // },

  async getSession(req, res) {
    const { id: fromUser } = req.user;
    const { groupId } = req.body;
    console.log(req.body);
    const { _id: group } = await GroupService.findGroupById(groupId);
    let session = await SessionService.getSession(group, fromUser);
    if (session == null) session = await SessionService.createSession(group, fromUser);
    return res.status(statusCode.OK).json(session);
  },
  async checkSession(req, res) {
    try {
      const { url } = req.body;
      const session = await SessionService.findByUrl(url);
      if (!session) {
        return res.status(statusCode.NOT_FOUND).json({ message: 'Session not found' });
      }
      const now = Date.now();
      const expiredTime = Math.floor(session.expireDate.getTime());
      if (expiredTime - now <= 0) {
        return res.status(statusCode.BAD_REQUEST).json({ message: 'Expired session' });
      }
      return res.status(statusCode.OK).json(session);
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async getChat(req, res) {

  },
};

export default SessionController;
