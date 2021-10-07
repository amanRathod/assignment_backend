/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const User = require('../../../../model/user/user');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Assignment = require('../../../../model/assignment/assignment');

exports.assignStudentToTA = async(req, res) => {
  try {
    // validate user input data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }
    // destructure the request body
    const { student_ids, ta_id } = req.body;

    // verify TA Id
    const ta = await TA.findOne({ta_id});
    if (!ta) {
      return res.status(400).json({
        error: 'TA not found',
      });
    }

    // push student_ids into TA assign_student array with no duplicate id's
    await TA.findOneAndUpdate({ta_id}, {$addToSet: {assign_student: {$each: student_ids}}}, {new: true});

    // add TA id into student's ta_id array with no duplicate id's
    await Student.updateMany({student_id: {$in: student_ids}}, {$addToSet: {ta_id: ta_id}}, {new: true});

    res.status(200).json({
      type: 'success',
      message: 'Student assigned to TA',
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.removeStudent = async(req, res) => {
  try {
    // validate user input data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(422).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }
    // destructure the request body
    const { student_ids, ta_id } = req.body;

    // remove TA Id according to student_id from student's ta_id array
    const student = await Student.updateMany({student_id: {$in: student_ids}}, {$pull: {ta_id: ta_id}}, {new: true});

    // remove student_id from TA assign_student array
    const ta = await TA.findOneAndUpdate({ta_id}, {$pull: {assign_student: {$in: student_ids}}}, {new: true});


    // veify TA Id and Student Id
    if (!student || !ta) {
      return res.status(404).json({
        type: 'warning',
        message: 'student_id or ta_id doesn\'t exists',
      });
    }

    return res.status(200).json({
      type: 'success',
      message: 'Student removed from assigned TA',
      assign_student: ta.assign_student,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Invalid Server',
    });
  }
};

exports.getAllTA = async(req, res) => {
  try {
    // get all User with user_type = teaching assistant
    const teachingAssistant = await User.find({ user_type: 'TA' })
      .populate('user_ref_id').exec();

    res.status(200).json({
      status: 'success',
      data: {
        teachingAssistant,
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

exports.getAllStudents = async(req, res) => {
  try {
    // get all student according to student user_type
    const students = await User.find({user_type: 'Student'}).populate('user_ref_id');
    res.status(200).json({
      status: 'success',
      data: {
        students,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

exports.getTAData = async(req, res) => {
  try {
    const { email } = req.user;

    // get TA data
    const adminData = await User.findOne({email}).populate('user_ref_id').exec();

    // get all assignment created by admin
    const allAssignment = adminData.user_ref_id.assignment;
    const assignments = await Assignment.find({_id: { $in: allAssignment} });

    // get all student
    const students = await User.find({user_type: 'Student'}).populate('user_ref_id');

    // get all teaching Assistant
    const ta = await User.find({ user_type: 'TA' })
      .populate('user_ref_id').exec();

    res.status(200).json({
      type: 'success',
      data: adminData,
      ta,
      students,
      assignments,
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

