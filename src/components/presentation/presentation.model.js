import mongoose from 'mongoose';

const { Schema } = mongoose;

const PresentationSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: String, required: true },
  modified: { type: Date, require: true },
  created: { type: Date, required: true },
  slides: { type: Array, default: [{question: "Question", options: []}] },
  isLive: { type: Boolean, default: false },
});

PresentationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Presentation = mongoose.model('Presentation', PresentationSchema);

export default Presentation;
