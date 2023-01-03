import mongoose from 'mongoose';

const { Schema } = mongoose;

const GroupSchema = new Schema({
  description: { type: String, required: true },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  roles: { type: Array, default: [] },
});

GroupSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.id;
    delete returnedObject.__v;
  },
});

const Group = mongoose.model('Group', GroupSchema);

export default Group;
