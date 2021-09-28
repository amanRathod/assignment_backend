const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// comments for assignments are stored in the database as a document of the form
const commentSchema = new Schema({
  assignmentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Submission',
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
