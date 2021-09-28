const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  registration_no: {
    type: String,
    required: true,
  },
  assignment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
  }],
  teaching_assistant: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeachingAssistant',
  }],
  grade: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
