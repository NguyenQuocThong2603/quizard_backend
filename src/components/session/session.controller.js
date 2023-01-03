import GroupService from '../group/group.service.js';
import statusCode from '../../constants/statusCode.js';
import SessionService from './session.service.js';
import io from '../socket/server.js';
import socketEvents from '../../constants/socketEvents.js';

const SessionController = {

  async list(req, res) {
    try {
      const { user } = req;
      const sessions = await SessionService.list(user.email);
      return res.status(statusCode.OK).json({ sessions });
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

  async addQuestion(req, res) {
    try {
      const { sessionId, text } = req.body;
      const session = await SessionService.find(sessionId);
      const newQuestion = {
        text,
        likes: [],
        answered: false,
        date: new Date(),
      };
      session.questions.push(newQuestion);
      session.save();
      io.in(session.presentationId.toString()).emit(socketEvents.addQuestion, newQuestion);
      return res.status(statusCode.OK).json({ question: newQuestion });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  },

  async toggleLikeQuestion(req, res) {
    try {
      const { id } = req.user;
      const { sessionId, questionIndex } = req.body;
      const session = await SessionService.getQuestionOfSession(sessionId);
      const { likes } = session.questions[questionIndex];
      let newLikes;
      if (likes.includes(id)) {
        session.questions[questionIndex].likes = likes.filter(x => x != id);
        newLikes = session.questions[questionIndex].likes;
      } else {
        likes.push(id);
        newLikes = likes;
      }
      await session.save();
      io.in(session.presentationId.toString())
        .emit(socketEvents.likeQuestion, { newLikes, questionIndex });
      return res.status(statusCode.OK).json({ likes: session.questions[questionIndex].likes });
    } catch (err) {
      console.log(err);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  },

  async toggleQuestionAnswered(req, res) {
    try {
      const { sessionId, questionIndex } = req.body;
      const session = await SessionService.getQuestionOfSession(sessionId);
      session.questions[questionIndex].answered = !session.questions[questionIndex].answered;
      await session.save();
      io.in(session.presentationId.toString())
        .emit(socketEvents.markedQuestion, { newAnswered: session.questions[questionIndex].answered, questionIndex });
      return res.status(statusCode.OK).json({ answered: session.questions[questionIndex].answered });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
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

  async addMessage(req, res) {
    try {
      const { sessionId, message } = req.body;
      const { user } = req;
      const session = await SessionService.find(sessionId);
      if (!session) {
        return res.status(statusCode.BAD_REQUEST).json({ message: 'Add message failed' });
      }
      const now = new Date();
      const newMessage = {
        user,
        message,
        date: now,
      };
      session.chats.push({
        user: user.id,
        message,
        date: now,
      });
      await session.save();
      io.in(session.presentationId.toString()).emit(socketEvents.chat, newMessage);
      return res.status(statusCode.OK).json({ chats: session.chats });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },

  async getChatMessage(req, res) {
    try {
      const { sessionId } = req.query;
      const session = await SessionService.getChatOfSession(sessionId);
      return res.status(statusCode.OK).json({ chats: session.chats });
    } catch (err) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
  },
};

export default SessionController;
