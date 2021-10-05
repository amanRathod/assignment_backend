const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  registration_no: {
    type: String,
  },
  phone: {
    type: String,
  },
  avatar: {
    type: String,
  },
  institute: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  user_type: {
    type: String,
    enum: ['Student', 'TA', 'Admin'],
    default: 'Student',
  },
  user_ref_id: {
    type: Schema.Types.ObjectId,
    refPath: 'user_type',
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
