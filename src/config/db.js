import mongoose from 'mongoose';
import config from './config.js';

function connectDB() {
  mongoose.connect(config.DATABASE_URL).then(() => console.log('Database connected'));
}

mongoose.plugin((schema) => {
  schema.options.toJSON = {
    transform: (document, returnedObject) => {
      try {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        
      } catch (error) {
        console.log(document);
        console.log(error);        
      }
    },
  };
});

export default connectDB;
