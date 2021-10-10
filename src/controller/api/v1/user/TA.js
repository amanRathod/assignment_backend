const User = require('../../../../model/user/user');
const Assignment = require('../../../../model/assignment/assignment');

exports.getAssignStudents = async(req, res) => {
  try {
    const { email } = req.user;
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
    const { email } = req.user;

    // get TA data
    const Ta = await User.findOne({email: email}).populate('user_ref_id');

    // get all assign student Data
    const assignStudents = Ta.user_ref_id.assign_student;
    const students = await User.find({_id: {$in: assignStudents}});

    // get all assignment assigned to TA
    const allAssignments = Ta.user_ref_id.assignment;
    const assignmentsData = await Assignment.find({_id: {$in: allAssignments}})
      .populate({
        path: 'submission',
        populate: {
          path: 'student_id',
          model: 'User',
        },
      });


    res.status(200).json({
      type: 'success',
      data: Ta,
      students,
      assignments: assignmentsData,
    });

  } catch (err) {
    return res.status(500).json({
      type: 'error',
      message: 'Invalid Server',
    });
  };
};
