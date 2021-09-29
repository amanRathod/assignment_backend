/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const User = require('../../../../model/user/user');
const Submission = require('../../../../model/assignment/submission');

exports.getStudentData = async(req, res) => {
  try {
    const { email } = req.user;

    // get student data
    const studentData = await User.findOne({email}).populate('user_ref_id').exec();

    // get all TA assigned to particular student
    const allTA_Id = studentData.user_ref_id.teaching_assistant;
    const ta = await User.find({_id: {$in: allTA_Id}});

    // get all Assignment submitted by student
    const allAssignment = studentData.user_ref_id.assigments;
    const assignments = await Submission.find({_id: allAssignment})
      .populate('assignment')
      .populate('comments');

    res.status(200).json({
      type: 'success',
      studentData,
      ta,
      assignments,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'success',
      message: 'Invalid Server',
    });
  }
};
