/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const User = require('../../../../model/user/user');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Assignment = require('../../../../model/assignment/assignment');

exports.getAssignStudents = async(req, res) => {
  try {
    const { email, id } = req.user;
    const TA = await User.find({email}).populate('user_ref_id');
    const assignStudents = TA[0].user_ref_id.assign_student;

    const students = await User.find({_id: {$in: assignStudents}})
      .populate('user_ref_id');

    res.status(200).json({
      type: 'success',
      data: students,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: 'error',
      message: 'Invalid Server',
    });
  }
};

exports.getTAData = async(req, res) => {
  try {
    const { email, id } = req.user;

    // get TA data
    const TA = await User.findOne({email: email}).populate('user_ref_id');

    // get all assign student Data
    const assignStudents = TA.user_ref_id.assign_student;
    const students = await User.find({_id: {$in: assignStudents}});

    // get all assignment assigned to TA
    const allAssignments = TA.user_ref_id.assignment;
    const assignments = await Assignment.find({_id: {$in: allAssignments}})
      .populate('submission');


    res.status(200).json({
      type: 'success',
      data: TA,
      students,
      assignments,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: 'error',
      message: 'Invalid Server',
    });
  };
};
