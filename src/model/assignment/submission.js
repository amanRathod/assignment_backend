const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

// submission assignment schema definition
const SubmissionSchema = new Schema({
  id: Number,
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

SubmissionSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Submission = mongoose.model('Submission', SubmissionSchema);
module.exports = Submission;
