const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// submission assignment schema definition
const submissionSchema = new Schema({
  assignment: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teaching_assistant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grade: {
    type: Number,
    required: false,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: false,
  }],
  filePath: {
    type: String,
    required: true,
  },
  submission_date: {
    type: Date,
    required: true,
  },
  submission_status: {
    type: String,
    enum: ['submitted', 'rejected'],
    required: true,
  },
}, {
  timestamps: true,
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
