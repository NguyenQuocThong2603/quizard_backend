import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
});

const User = mongoose.model('User', UserSchema);

export default User;
