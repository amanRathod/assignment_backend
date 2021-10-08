/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const Student = require('../../../../model/user/student');
// const TA = require('../../../../model/user/teacher');
const Comment = require('../../../../model/assignment/comment');
const Submission = require('../../../../model/assignment/submission');
const { uploadFile } = require('../../../../../s3');
const Assignment = require('../../../../model/assignment/assignment');


exports.submit = async(req, res) => {
  try {
    // validate client input data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warining',
        message: error.array()[0].msg,
      });
    }

    const { assignmentId } = req.body;

    // s3 to store submitted assignment pdf/doc
    const filePath = await uploadFile(req.file);

    // create Submission collection
    const submission = await Submission.create({
      ...req.body,
      filePath: filePath.Location,
      student_id: req.user._id,
    });

    // update student collection
    await Student.findByIdAndUpdate({_id: req.user._id}, {
      $addToSet: {submission: submission._id},
    });

    // update assignment collection
    const assignment = await Assignment.findOneAndUpdate({_id: assignmentId}, { $addToSet: {submission: submission._id} });
    if (!assignment) {
      return res.status(404).json({
        type: 'error',
        message: 'Assignment not found',
      });
    }

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

    //  evalute assingment by grading
    const submit = await Submission.findByIdAndUpdate({_id: assignmentId}, {
      grade,
      submission_status,
    });
    if (!submit) {
      res.status(404).json({
        type: 'error',
        message: 'Assignment not found',
      });
    }

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
