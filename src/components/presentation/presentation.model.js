import mongoose from 'mongoose';
import slideTypes from '../../constants/slideTypes.js';

const { Schema } = mongoose;

const PresentationSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  slides: {
    type: [Object,
      {
        type: { type: String, enum: ['Multiplechoice', 'Heading', 'Paragraph'] },
        question: String,
        options: { type: Array },
        header: String,
        content: String,
      },
    ],
    default: [{
      type: 'Multiplechoice',
      question: '',
      options: [''],
      hearder: '',
      content: '',
    }],
  },
  modified: { type: Date, require: true },
  created: { type: Date, required: true },
  currentSession: { type: Schema.Types.ObjectId, ref: 'Session', default: null },
  currentSlideIndex: { type: Number, default: 0 },
});

// PresentationSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject.id.toString();
//     delete returnedObject.id;
//     delete returnedObject.__v;
//   },
// });

const Presentation = mongoose.model('Presentation', PresentationSchema);

export default Presentation;
