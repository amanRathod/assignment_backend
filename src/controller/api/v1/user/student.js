/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const User = require('../../../../model/user/user');
const Submission = require('../../../../model/assignment/submission');
const Assignment = require('../../../../model/assignment/assignment');
const Student = require('../../../../model/user/student');

exports.getStudentData = async(req, res) => {
  try {
    const { email } = req.user;

    // get student data
    const studentData = await User.findOne({email}).populate('user_ref_id').exec();

    // get all TA assigned to particular student
    const allTA_Id = studentData.user_ref_id.ta_id;
    const ta = await User.find({_id: {$in: allTA_Id}});

    // get all Assignment assigned to particular student
    const allAssignment = studentData.user_ref_id.assignment;
    const assignments = await Assignment.find({_id: { $in: allAssignment} });

    // get all submitted assignment by student
    const allSubmission = studentData.user_ref_id.submission;
    const submissions = await Submission.find({_id: { $in: allSubmission}}).populate('comments');

    res.status(200).json({
      type: 'success',
      data: studentData,
      ta,
      assignments,
      submissions,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'success',
      message: 'Invalid Server',
    });
  }
};
