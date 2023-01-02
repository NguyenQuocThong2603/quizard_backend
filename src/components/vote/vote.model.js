import mongoose from 'mongoose';

const { Schema } = mongoose;

const VoteSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId },
  question: String,
  vote: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  date: Date,
});

const Vote = mongoose.model('Vote', VoteSchema);

export default Vote;
