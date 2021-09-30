const mongoose = require('mongoose');
//  const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

// assignment schema definition
const AssignmentSchema = new Schema({
  // id: Number,
  title: {
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
    default: 'inactive',
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100,
  },
  assigned_TA: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  submission: [{
    type: Schema.Types.ObjectId,
    ref: 'Submission',
  }],
}, {
  timestamps: true,
});

// AssignmentSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Assignment = mongoose.model('Assignment', AssignmentSchema);
module.exports = Assignment;
