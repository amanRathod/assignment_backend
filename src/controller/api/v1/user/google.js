/* eslint-disable max-len */
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const redirectURI = 'auth/google';
const User = require('../../../../model/user/user');

// get the auth URL
function getGoogleAuthURL() {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: `http://localhost:5000/${redirectURI}`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  return `${rootUrl}?${new URLSearchParams(options)}`;
}

// Getting login URL
app.get('/google/url', (req, res) => {
  return res.send(getGoogleAuthURL());
});

const getGoogleToken = async(code) => {
  try {
    // get the access token from google server using the code from the url query
    const url = 'https://oauth2.googleapis.com/token';
    const params = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `http://localhost:5000/${redirectURI}`,
      grant_type: 'authorization_code',
    };
    const response = await axios.post(url, params);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// Getting the user from Google with the code
app.get('/google', async(req, res) => {
  try {
    // get code from the request
    const { code } = req.query;

    // get the token from google
    const token = await getGoogleToken(code);
    const { access_token } = token;

    // get the user info from google
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // destructure the data
    const { email, name, picture } = data;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({
        email,
        name,
        avatar: picture,
      });
      await newUser.save();
      user = newUser;
    }

    // create jwt token
    const jwt_token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET_KEY);

    // send the token to the client side as cookie
    res.cookie('token', jwt_token, { httpOnly: true });
    res.cookie('user', email, { httpOnly: false });

    // redirect to dashboard if user have already filled the personal details
    if (user.registration_no) {
      res.redirect(`http://localhost:3000/${user.user_type}/dashboard`);
    } else {
      res.redirect('http://localhost:3000/personal-details');
    }
  } catch (error) {
    console.log(error);
  }
});

// Getting the current user middleware
app.get('/me', (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies['token'], process.env.JWT_SECRET_KEY);
    return res.send(decoded);
  } catch (err) {
    console.log(err);
    res.send(null);
  }
});

module.exports = app;

