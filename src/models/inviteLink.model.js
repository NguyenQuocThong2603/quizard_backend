import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
const { Schema } = mongoose;

const InviteLinkSchema = new Schema({
  url: { type: String, required: true, unique: true, default: nanoid(15) },
  expireDate: { type: Date, required: true },
  group: { type: Schema.Types.ObjectId, required: true },
  fromUser: { type: Schema.Types.ObjectId, required: true },
});

const InviteLink = mongoose.model('InviteLink', InviteLinkSchema);

export default InviteLink;
