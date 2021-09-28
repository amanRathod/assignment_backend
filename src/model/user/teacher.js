/* eslint-disable max-len */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// teaching assistant for assignment work
const teachingAssistantSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignment: [{
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
  }],
  assign_student: [{
    type: Schema.Types.ObjectId,
    ref: 'Student',
  }],
}, {
  timestamps: true,
});

const TeachingAssistant = mongoose.model('TeachingAssistant', teachingAssistantSchema);
module.exports = TeachingAssistant;
