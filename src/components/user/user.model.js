import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'] },
  dob: { type: String },
  isVerified: { type: Boolean, default: false },
  refreshToken: String,
  confirmationCode: { type: String },
  joinedGroups: { type: [Schema.Types.ObjectId], ref: 'Group', default: [] },
  ownedGroups: { type: [Schema.Types.ObjectId], ref: 'Group', default: [] },
});

const User = mongoose.model('User', UserSchema);

export default User;
