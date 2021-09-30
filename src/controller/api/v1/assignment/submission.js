/* eslint-disable max-len */
const { validationResult } = require('express-validator');
// const multer = require('multer');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Comment = require('../../../../model/assignment/comment');
const Submission = require('../../../../model/assignment/submission');
// const { uploadFile } = require('../../../../../s3');

// const upload = multer({ dest: 'uploads/' });

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

    // multer to form file location
    // upload.single('file');

    // const filePath = uploadFile(req.file);
    const filePath = 'https://bucket-007.s3.ap-south-1.amazonaws.com/CUP-+Batch-1-+2021-Assignment-5.pdf';

    const submit = await Submission.create({
      ...req.body,
      student_id: req.user._id,
      filePath,
    });

    // add submitted assignment Id into submittedAssignment array attribute of Student model with no duplicate Id
    const student = await Student.findOne({student_id: req.user._id});
    student.submittedAssignment = student.submittedAssignment.concat(submit._id).filter((id, index) => student.subbmitedAssignment.indexOf(id) === index);
    student.save();

    return res.status(201).json({
      type: 'success',
      message: 'Assignment Submitted',
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: 'error',
      message: err.message,
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

    // check if assignment exists
    const assignment = await Submission.findById({_id: assignmentId});
    if (!assignment) {
      return res.status(404).json({
        type: 'error',
        message: 'Assignment not found',
      });
    }

    // check if TA has right to evalute the assignment of particular student
    const ta = await TA.findOne({_id: req.user._id});
    const rightToGrade = ta.assign_student.include(assignment.student_id);
    if (!rightToGrade) {
      return res.status(404).json({
        type: 'warning',
        message: 'You dont\t have right to grade this assignment',
      });
    }

    //  evalute assingment by grading
    await Submission.updateMany({grade, submission_status});

    return res.status(201).json({
      type: 'success',
      message: 'assignment evaluated',
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: 'error',
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

    const { assignmentId } = req.body;

    const assignmentExists = await Submission.findById({_id: assignmentId});
    if (!assignmentExists) {
      return res.status(404).json({
        type: 'error',
        message: 'Assignment not found',
      });
    }

    const comment = await Comment.create({
      ...req.body,
      userId: req.user._id,
    });

    return res.status(200).json({
      type: 'success',
      message: 'Comment added',
      data: comment,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: 'error',
      message: 'server error',
    });
  }
};
