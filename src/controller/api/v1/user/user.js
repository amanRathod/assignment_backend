/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../../model/user/user');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Admin = require('../../../../model/user/admin');

exports.login = async(req, res, next) => {
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
    const { email, password } = req.body;

    // verify user email
    const user = await User.findOne({ email });

    // verify User password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!user || !isMatch) {
      return res.status(404).json({
        type: 'error',
        message: 'User email or passowrd is incorrect',
      });
    }

    // create jwt token
    const token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET_KEY);

    return res.status(200).json({
      type: 'success',
      token,
      email,
      user_type: user.user_type,
    });

  } catch (err) {
    return res.status(500).json({
      type: 'error',
      message: 'Server is Invalid',
    });
  }
};

exports.register = async(req, res) => {
  try {
    // validate user input data
    const error = validationResult(req);
    if (!error) {
      res.send(404).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }

    // destructure the request body
    const { email, password, user_type, name } = req.body;

    // unique registration number according to user_type (eg: Student-1, TA-1, etc)
    const registration_no = `${user_type}-${req.body.registration_no}`;

    // email must be unique
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        type: 'warning',
        message: 'User already exists',
      });
    }

    // registration number must be unique
    const registration_No = await User.findOne({ registration_no });
    if (registration_No) {
      return res.status(400).json({
        type: 'warning',
        message: 'Registration number already exists',
      });
    }

    // hash-password of User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a User according to user type
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      user_type,
      registration_no,
    });

    let user_role;
    // create user according to user_type for specific user_type model
    if (user_type === 'Student') {
      user_role = await Student.create({student_id: user._id});
    } else if (user_type === 'TA') {
      user_role = await TA.create({ta_id: user._id});
    } else if (user_type === 'Admin') {
      user_role = await Admin.create({admin_id: user._id});
    }

    user.user_ref_id = user_role._id;
    user.save();

    return res.status(201).json({
      type: 'success',
      message: 'User created',
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Server is Invalid',
    });
  }
};

exports.updateProfile = async(req, res) => {
  try {

    // destructure the request body
    const { email, id } = req.user;

    // update User profile
    const user = await User.findOneAndUpdate({ email }, { $set: req.body }, { new: true });

    // update user profile according to user type
    if (user.user_type === 'Student') {
      await Student.findOneAndUpdate({ user: id }, { $set: req.body }, { new: true });
    } else if (user.user_type === 'TA') {
      await TA.findOneAndUpdate({ user: id }, { $set: req.body }, { new: true });
    } else if (user.user_type === 'Admin') {
      await Admin.findOneAndUpdate({ user: id }, { $set: req.body }, { new: true });
    }

    // return the updated User profile
    return res.status(200).json({
      type: 'success',
      message: 'User profile updated',
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: 'error',
      message: 'Server is Invalid',
    });
  };
};
