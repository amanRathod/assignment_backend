/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Admin = require('../../../../model/user/admin');
const Assignment = require('../../../../model/assignment/assignment');
const { uploadFile } = require('../../../../../s3');

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
    // get url from s3 bucket
    // upload file to s3
    const filePath = await uploadFile(req.file);

    // create new assignment
    const assignment = new Assignment({
      ...req.body,
      filePath: filePath.Location,
    });
    await assignment.save();

    // add assignment id to admin's assignment array without duplicate id in assignment array
    await Admin.findOneAndUpdate({admin_id: req.user.id}, {$addToSet: {assignment: assignment._id}});

    return res.status(200).json({
      type: 'success',
      message: 'Assignment created',
    });

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.assignedAssignment = async(req, res) => {
  try {

    const { ta_id, assignmentId } = req.body;

    // verify TA Id
    const ta = await TA.find({ta_id: {$in: ta_id}});

    // add selected TA Id's into assignment's assigned_TA array
    const assignment = await Assignment.findByIdAndUpdate({_id: assignmentId}, {$addToSet: {assigned_TA: ta_id}});

    if (!assignment) {
      return res.status(404).json({
        type: 'error',
        message: 'assignment not found',
      });
    }

    // update TA's assignment array with no duplicates assignment id
    await TA.updateMany({ta_id: {$in: ta_id}}, {$addToSet: {assignment: assignmentId}});

    // store the assign_students of selected TA
    let students = [];
    for (let i = 0; i < ta.length; i++) {
      for (let j = 0; j < ta[i].assign_student.length; j++) {
        students.push(ta[i].assign_student[j]);
      }
    }

    // add assignmentId into student's assignment array attribute
    await Student.updateMany({student_id: {$in: students}}, {$addToSet: {assignment: assignmentId}});

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

    let filePath;
    if (req.file) {
      const file = await uploadFile(req.file);
      filePath = file.Location;
    }

    // update assignment in Assignment collection
    const assignment = await Assignment.findByIdAndUpdate({_id: assignmentId}, {
      ...req.body,
      filePath: req.file ? filePath : req.body.filepath,
    });
    if (!assignment) {
      return res.status(201).json({
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

    // delete assigment Id from TA and Student's assignment array attribute and delete assignment from Assignment collection and delete file from s3 bucket
    const assignment = await Assignment.findOne({_id: assignmentId});
    if (!assignment) {
      return res.status(404).json({
        type: 'error',
        message: 'assignment not found',
      });
    }

    // delete assignment from TA's assignment array
    const ta = await TA.updateMany({ta_id: {$in: assignment.assigned_TA}}, {$pull: {assignment: assignmentId}});

    // delete assignment from Admin assignment array
    await Admin.findOneAndUpdate({admin_id: req.user._id}, {$pull: {assignment: assignmentId}});

    // store the assign_students of selected TA
    let students = [];
    for (let i = 0; i < ta.length; i++) {
      for (let j = 0; j < ta[i].assign_student.length; j++) {
        students.push(ta[i].assign_student[j]);
      }
    }

    // delete assignment from student's assignment array attribute
    await Student.updateMany({student_id: {$in: students}}, {$pull: {assignment: assignmentId}});

    // finally delete assignment
    await Assignment.findByIdAndDelete({_id: assignmentId});

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
