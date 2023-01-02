import mongoose from 'mongoose';

const { Schema } = mongoose;

const SessionSchema = new Schema({
  hosts: { type: [String], required: true },
  presentationId: { type: Schema.Types.ObjectId, ref: 'Presentation', required: true },
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
      question: String,
      vote: Number,
      answered: Boolean,
      date: Date,
    }],
    default: [],
  },
  slideToResultMap: {
    type: Object,
    required: true,
  },
});

const Session = mongoose.model('Session', SessionSchema);

export default Session;
