const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

// submission assignment schema definition
const SubmissionSchema = new Schema({
  id: Number,
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ta_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grade: {
    type: Number,
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
    default: Date.now(),
  },
  submission_status: {
    type: String,
    enum: ['submitted', 'rejected', 'accepted'],
    default: 'submitted',
  },
}, {
  timestamps: true,
});

SubmissionSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Submission = mongoose.model('Submission', SubmissionSchema);
module.exports = Submission;
