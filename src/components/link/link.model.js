import mongoose from 'mongoose';

const { Schema } = mongoose;

const LinkSchema = new Schema({
  url: { type: String, required: true, unique: true },
  expireDate: { type: Date, required: true },
  group: { type: Schema.Types.ObjectId },
  fromUser: { type: Schema.Types.ObjectId },
  toEmail: { type: String },
  status: { type: String, enum: ['Valid', 'Invalid'], default: 'Valid' },
});

const Link = mongoose.model('Link', LinkSchema);

export default Link;
