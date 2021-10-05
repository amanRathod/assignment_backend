/* eslint-disable max-len */
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const axios = require('axios');


const redirectURI = 'auth/google';

// sign in with google
const getGoogleAuthURL = () => {
  try {

    const url = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectURI,
      response_type: 'code',
      scope: 'profile email',
    };
    return `${url}?${new URLSearchParams(params)}`;
  } catch (error) {
    throw error;
  }
};

// Getting login URL for google
const getGoogleLoginURL = (req, res) => {
  const url = getGoogleAuthURL();
  res.redirect(url);
};
app.get('/auth/google', getGoogleLoginURL);


// get token
const getGoogleToken = async(code) => {
  try {

    const url = 'https://oauth2.googleapis.com/token';
    const params = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectURI,
      grant_type: 'authorization_code',
    };
    const response = await axios.post(url, params);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// Getting the user from Google with the code
app.get('/auth/google/', async(req, res) => {
  try {
    const { code } = req.query;
    const token = await getGoogleToken(code);
    const { access_token } = token;
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const { email, name, picture } = data;
    const user = {
      email,
      name,
      picture,
    };
    const tokenn = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', tokenn, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});


// get user profile
const getGoogleUserProfile = async(token) => {
  try {
    const url = 'https://www.googleapis.com/oauth2/v1/userinfo';
    const params = {
      access_token: token,
    };
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};


// Getting the current user profile using nodejs and express framework for getting the current user profile using nodejs and express framework
const getCurrentUserProfile = async(req, res) => {
  const { token } = req.session;
  const user = await getGoogleUserProfile(token);
  res.json(user);
};

// Getting the current user profile using nodejs and express framework for getting the current user profile using nodejs and express framework
app.get('/api/v1/user/profile', getCurrentUserProfile);
