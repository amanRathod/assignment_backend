const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  assignment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
  }],
  submittedAssignment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
  }],
  ta_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TA',
  }],
  assigned: {
    type: Boolean,
    default: false,
  },
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
