/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const multer = require('multer');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Comment = require('../../../../model/assignment/comment');
const Submission = require('../../../../model/assignment/submission');
const { uploadFile } = require('../../../../../s3');

const upload = multer({ dest: 'uploads/' });

exports.submit = async(req, res) => {
  try {
    // validate client input data
    upload.single('file');
    console.log(req.body);
    console.log(req.file);
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warining',
        message: error.array()[0].msg,
      });
    }

    // multer to form file location
    console.log(req.file.path);

    const filePath = uploadFile(req.file);
    // const filePath = 'https://bucket-007.s3.ap-south-1.amazonaws.com/CUP-+Batch-1-+2021-Assignment-5.pdf';

    // create Submission collection
    const submission = await Submission.create({
      ...req.body,
      filePath,
      student_id: req.user._id,
    });

    // update student collection
    await Student.findByIdAndUpdate({_id: req.user._id}, {
      $addToSet: {submittedAssignment: submission._id},
    });

    return res.status(200).json({
      type: 'success',
      message: 'Assignment submitted',
      data: submission,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

exports.evaluate = async(req, res) => {
  try {
    // validate client input data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warining',
        message: error.array()[0].msg,
      });
    }

    const { grade, assignmentId, submission_status } = req.body;

    const assignmentExists = await Submission.findById({_id: assignmentId});
    if (!assignmentExists) {
      return res.status(404).json({
        type: 'error',
        message: 'Assignment not found',
      });
    }

    // check if TA has right to evalute the assignment of particular student
    const ta = await TA.findOne({_id: req.user._id});
    if (!ta.assignment.includes(assignmentId)) {
      return res.status(403).json({
        type: 'error',
        message: 'You are not authorized to evaluate this assignment',
      });
    }

    //  evalute assingment by grading
    await Submission.findByIdAndUpdate({_id: assignmentId}, {
      grade,
      submission_status,
    });

    return res.status(200).json({
      type: 'success',
      message: 'Assignment evaluated',
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

exports.comment = async(req, res) => {
  try {
    // validate client input data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warining',
        message: error.array()[0].msg,
      });
    }

    // create comment collection
    const comment = await Comment.create({
      ...req.body,
      student_id: req.user._id,
    });

    // update submission collection
    const submission_idExists = await Submission.findByIdAndUpdate({_id: req.body.submission_id}, {
      $addToSet: {comment: comment._id},
    });

    if (!submission_idExists) {
      return res.status(404).json({
        type: 'error',
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      type: 'success',
      message: 'Comment added',
      data: comment,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
