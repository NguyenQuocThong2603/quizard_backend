import mongoose from 'mongoose';

const { Schema } = mongoose;

const GroupSchema = new Schema({
  groupId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  roles: { type: Array, default: [] },
});

const Group = mongoose.model('Group', GroupSchema);

export default Group;
