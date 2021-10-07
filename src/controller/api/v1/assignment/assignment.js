/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Admin = require('../../../../model/user/admin');
const Assignment = require('../../../../model/assignment/assignment');
const { uploadFile } = require('../../../../../s3');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.createAssignment = async(req, res) => {
  try {
    // validate client data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }

    //  multer to upload file
    const file = req.file;
    if (!file) {
      return res.status(422).json({
        type: 'warning',
        message: 'Please upload a file',
      });
    }

    // multer to get file path
    upload.single('file');

    // get url from s3 bucket
    // upload file to s3
    const filePath = await uploadFile(file);
    // const filePath = 'https://bucket-007.s3.ap-south-1.amazonaws.com/CUP-+Batch-1-+2021-Assignment-5.pdf';

    // create new assignment
    const assignment = new Assignment({
      ...req.body,
      filePath,
    });
    await assignment.save();

    // add assignment id into admin's assignment array with no duplicates assignment id
    const admin = await Admin.findOne({admin_id: req.user._id});
    const adminAssignment = admin.assignment.filter(assignment_id => assignment_id !== assignment._id);
    adminAssignment.push(assignment._id);
    admin.assignment = adminAssignment;
    await admin.save();

    return res.status(201).json({
      type: 'success',
      message: 'Assignment created',
      data: {
        assignmentId: assignment._id,
        filePath,
      },
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.assignedAssignment = async(req, res) => {
  try {
    // validate client data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }

    const { ta_id, assignmentId } = req.body;

    // verify TA Id
    const ta = await TA.findOne({ta_id});
    if (!ta) {
      return res.status(404).json({
        type: 'warning',
        message: 'TA not found',
      });
    }

    const assignment = await Assignment.findById({_id: assignmentId});

    if (!assignment) {
      return res.status(404).json({
        type: 'error',
        message: 'assignment not found',
      });
    }

    // update TA assignment with no duplicates assignment id
    const taAssignment = ta.assignment.filter(assignment_id => assignment_id !== assignmentId);
    taAssignment.push(assignmentId);
    ta.assignment = taAssignment;
    await ta.save();


    // update student assignment with no duplicates assignment id
    const assignStudents = ta.assign_student;
    for (let i = 0; i < assignStudents.length; i++) {
      const student = await Student.findOne({student_id: assignStudents[i]});
      const studentAssignment = student.assignment.filter(assignment_id => assignment_id !== assignmentId);
      studentAssignment.push(assignmentId);
      student.assignment = studentAssignment;
      await student.save();
    }

    return res.status(200).json({
      type: 'success',
      message: 'Assignment assigned to TA',
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.updateAssignment = async(req, res) => {
  try {
    // validate client data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }

    const { assignmentId } = req.body;

    // update assignment in Assignment collection
    const assignment = await Assignment.findByIdAndUpdate({_id: assignmentId}, req.body);

    if (!assignment) {
      return res.status(404).json({
        type: 'error',
        message: 'assignment not found',
      });
    }

    return res.status(200).json({
      type: 'success',
      message: 'Assignment edited',
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.deleteAssignment = async(req, res) => {
  try {
    // validate client data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }

    const { assignmentId } = req.body;

    // delete assignment from Assignment collection
    const assignment = await Assignment.findByIdAndDelete({_id: assignmentId});
    if (!assignment) {
      return res.status(404).json({
        type: 'error',
        message: 'assignment not found',
      });
    }

    // delete assignment Id from admin's assignment array
    const admin = await Admin.findOne({admin_id: req.user._id});
    const adminAssignment = admin.assignment.filter(assignment_id => assignment_id !== assignmentId);
    admin.assignment = adminAssignment;
    await admin.save();


    return res.status(200).json({
      type: 'success',
      message: 'Assignment deleted',
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
