import mongoose from 'mongoose';

const { Schema } = mongoose;

const SessionSchema = new Schema({
  hosts: { type: [String], required: true },
  presentationId: { type: Schema.Types.ObjectId, ref: 'Presentation', required: true },
  presentationName: { type: String, required: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
  date: { type: Date, required: true },
  chats: {
    type: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      message: String,
      date: Date,
    }],
    default: [],
  },
  questions: {
    type: [{
      text: String,
      likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
      answered: { type: Boolean, default: false },
      date: Date,
    }],
    default: [],
  },
  results: {
    type: [{
      question: String,
      options: [{
        text: String,
        votes: [{
          user: { type: Schema.Types.ObjectId, ref: 'User' },
          date: Date,
        }],
      }],
    }],
    require: true,
  },
  slideToResultMap: {
    type: Object,
    required: true,
  },
});

const Session = mongoose.model('Session', SessionSchema);

export default Session;
