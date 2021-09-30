/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const User = require('../../../../model/user/user');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const { findByIdAndUpdate } = require('../../../../model/user/user');

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

    // push student_ids into TA assign_student array attribute and avoid duplicates id's
    ta.assign_student = ta.assign_student.concat(student_ids).filter((id, index) => ta.assign_student.indexOf(id) === index);
    await ta.save();

    // add TA id into student's ta_id array attribute and avoid duplicates id's
    const students = await Student.find({student_id: {$in: student_ids}});
    students.forEach((student) => {
      student.ta_id = student.ta_id.concat(ta_id).filter((id, index) => ta_id.indexOf(id) === index);
      student.assigned = true;
      student.save();
    });

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
    const { student_id, ta_id } = req.body;

    // remove TA Id from student_id of Student Model
    const student = await Student.findOneAndUpdate({student_id}, {$pull: {ta_id: ta_id}});

    // remove student_id from assign_student of TA Model
    const ta = await TA.findOneAndUpdate({ta_id}, {$pull: {assign_student: student_id}});

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
