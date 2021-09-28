const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// assignment schema definition
const AssignmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['inactive', 'active', 'completed'],
    required: true,
  },
  totalGrade: {
    type: Number,
    required: true,
    default: 100,
  },
  submission: [{
    type: Schema.Types.ObjectId,
    ref: 'Submission',
  }],
}, {
  timestamps: true,
});

const Assignment = mongoose.model('Assignment', AssignmentSchema);
module.exports = Assignment;
