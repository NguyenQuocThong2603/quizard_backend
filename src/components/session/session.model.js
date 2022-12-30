import mongoose from 'mongoose';

const { Schema } = mongoose;

const SessionSchema = new Schema({
  hosts: { type: [String], required: true },
  date: { type: Date, required: true },
  chats: {
    type: [{
      user: Schema.Types.ObjectId,
      message: String,
      date: Date
    }],
    default: []
  },
  questions: {
    type: [{
      question: String,
      vote: Number,
      answered: Boolean,
      date: Date
    }],
    default: []
  },
  results: {
    type: [{
      question: String,
      options: [{
        text: String,
        votes: [{
          user: { type: Schema.Types.ObjectId, ref: "User" },
          date: Date
        }]
      }]
    }],
    require: true
  }
  // url: { type: String, required: true, unique: true },
  // expireDate: { type: Date, required: true },
  // group: { type: Schema.Types.ObjectId },
  // fromUser: { type: Schema.Types.ObjectId },
  // toEmail: { type: String },
  // status: { type: String, enum: ['Valid', 'Invalid'], default: 'Valid' },
});

const Session = mongoose.model('Session', SessionSchema);

export default Session;
