const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  admin_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignment: [{
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
  }],
}, {
  timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
