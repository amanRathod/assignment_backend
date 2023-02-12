/* eslint-disable max-len */
const User = require('../../../../model/user/user');
const Student = require('../../../../model/user/student');

exports.getStudentData = async(req, res) => {
  try {
    const { email } = req.user;

    // get student data
    const studentData = await User.findOne({email}).populate('user_ref_id').exec();

    // get student assignment data, ta_id data and submission data
    const student = await Student.findOne({student_id: req.user.id}).populate('assignment').populate('ta_id').populate('submission').exec();

    // get all TA assigned to particular student
    const allTA_Id = studentData.user_ref_id.ta_id;
    const ta = await User.find({_id: {$in: allTA_Id}});

    res.status(200).json({
      type: 'success',
      data: studentData,
      ta,
      assignments: student.assignment,
      submissions: student.submission,
    });

  } catch (err) {
    res.status(500).json({
      type: 'success',
      message: 'Invalid Server',
    });
  }
};
