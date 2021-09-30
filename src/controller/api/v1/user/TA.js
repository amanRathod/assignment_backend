/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const User = require('../../../../model/user/user');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');

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
