/* eslint-disable max-len */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// teaching assistant for assignment work
const TASchema = new Schema({
  ta_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignment: [{
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
  }],
  assign_student: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  assigned: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const TA = mongoose.model('TA', TASchema);
module.exports = TA;
