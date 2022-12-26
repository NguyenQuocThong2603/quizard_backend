import mongoose from 'mongoose';

const { Schema } = mongoose;

const PresentationSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  slides: { type: [{ question: String, options: [{ text: String, vote: Number }] }], default: [{ question: '', options: [{ text: '', vote: 0 }] }] },
  modified: { type: Date, require: true },
  created: { type: Date, required: true },
  isLive: { type: Boolean, default: false },
  currentSlideIndex: { type: Number, default: 0 },
});

mongoose.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Presentation = mongoose.model('Presentation', PresentationSchema);

export default Presentation;
