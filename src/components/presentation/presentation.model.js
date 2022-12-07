import mongoose from 'mongoose';

const { Schema } = mongoose;

const PresentationSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: String, required: true },
  modified: { type: Date, default: new Date() },
  created: { type: Date, default: new Date() },
  slides: { type: Array, default: [] },
});

const Presentation = mongoose.model('Presentation', PresentationSchema);

export default Presentation;
