/* eslint-disable max-len */
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../../model/user/user');
const Student = require('../../../../model/user/student');
const TA = require('../../../../model/user/teacher');
const Admin = require('../../../../model/user/admin');
const { uploadFile } = require('../../../../../s3');

exports.login = async(req, res, next) => {
  try {
    // validate user input data
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(200).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }

    // destructure the request body
    const { email, password } = req.body;

    // verify user email
    const user = await User.findOne({email: email});
    if (!user) {
      return res.status(200).json({
        type: 'error',
        message: 'User email or passowrd is incorrect',
      });
    }

    // verify User password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({
        type: 'error',
        message: 'User email or passowrd is incorrect',
      });
    }

    // create jwt token
    const token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET_KEY, {
      expiresIn: '2h',
    });

    return res.status(200).json({
      type: 'success',
      token,
      email,
      user_type: user.user_type,
      bool: !!user.registration_no,
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
      return res.send(201).json({
        type: 'warning',
        message: error.array()[0].msg,
      });
    }

    // destructure the request body
    const { email, password, user_type, name } = req.body;

    // email must be unique
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(201).json({
        type: 'warning',
        message: 'User already exists',
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
      avatar: 'https://bucket-007.s3.ap-south-1.amazonaws.com/default.jpg',
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
    return res.status(500).json({
      type: 'error',
      message: 'Server is Invalid',
    });
  }
};

exports.updateProfile = async(req, res) => {
  try {

    // destructure the request body
    const { email, id } = req.user;
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(400).json({
        type: 'error',
        message: 'User doesn\t exists',
      });
    }

    // create file if req.file exists
    if (req.file) {
      const avatar = await uploadFile(req.file);
      req.body.avatar = avatar.Location;
    }

    // update registration no eg: 'TA-32', 'Student-34'
    if (req.body.registration_no) {
      const registration_no = `${userExists.user_type}-${req.body.registration_no}`;

      // check if registration_no is unique or not
      const registration_No = await User.findOne({ registration_no });
      if (registration_No) {
        return res.status(200).json({
          type: 'warning',
          message: 'Registration number already exists',
        });
      }

    }

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
      data: user.user_type,
    });

  } catch (err) {
    return res.status(500).json({
      type: 'error',
      message: 'Server is Invalid',
    });
  };
};

// this is separate function because it creats a new user according to userType for googleUser authentication
exports.updateGoogleProfile = async(req, res) => {
  try {
    // destructure the request body
    const { email } = req.user;
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(400).json({
        type: 'error',
        message: 'User doesn\t exists',
      });
    }

    const user_type = req.body.userType;

    const registration_no = `${userExists.user_ype}-${req.body.registration_no}`;

    // check if registration_no is unique or not
    const registration_No = await User.findOne({ registration_no });
    if (registration_No) {
      return res.status(200).json({
        type: 'warning',
        message: 'Registration number already exists',
      });
    }

    // update User profile
    const user = await User.findOneAndUpdate({ email }, { ...req.body, user_type }, { new: true });

    let user_role;
    // create user according to user_type for specific user_type model
    if (user_type === 'Student') {
      user_role = await Student.create({student_id: user._id});
    } else if (user_type === 'TA') {
      user_role = await TA.create({ta_id: user._id});
    } else if (user_type === 'Admin') {
      user_role = await Admin.create({admin_id: user._id});
    }
    // save userData in user_ref_id
    user.user_ref_id = user_role._id;
    user.save();

    // return the updated User profile
    return res.status(200).json({
      type: 'success',
      message: 'User profile updated',
      data: user.user_type,
    });

  } catch (err) {
    return res.status(500).json({
      type: 'error',
      message: 'Server is Invalid',
    });
  };
};
