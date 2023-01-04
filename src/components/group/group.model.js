import mongoose from 'mongoose';

const { Schema } = mongoose;

const GroupSchema = new Schema({
  description: { type: String, required: true },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  roles: { type: Array, default: [] },
});

const Group = mongoose.model('Group', GroupSchema);

export default Group;
