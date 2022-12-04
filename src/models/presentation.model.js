import mongoose from 'mongoose';

const { Schema } = mongoose;

const PresentationSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  modified: { type: Date, default: Date.now() },
  created: { type: Date, default: Date.now() },
  slides: { type: Array, default: [] },
});

const Presentation = mongoose.model('Presentation', PresentationSchema);

export default Presentation;
