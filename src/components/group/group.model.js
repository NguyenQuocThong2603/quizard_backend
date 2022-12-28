import mongoose from 'mongoose';

const { Schema } = mongoose;

const GroupSchema = new Schema({
  groupId: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  roles: { type: Array, default: [] },
});

GroupSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Group = mongoose.model('Group', GroupSchema);

export default Group;
