const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileExtension: {
    type: String,
    required: true,
  },
  fileContent: {
    type: String,
    required: true,
  },
  fileSubmissionDate: {
    type: Date,
    required: true,
  },
  fileSubmissionTime: {
    type: Date,
    required: true,
  },
  fileSubmissionStatus: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
