/* eslint-disable max-len */
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const queryString = require('query-string');
const redirectURI = 'auth/google';

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

  return `${rootUrl}?${queryString.stringify(options)}`;
}

// Getting login URL
app.get('/auth/google/url', (req, res) => {
  return res.send(getGoogleAuthURL());
});

function getTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
}) {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  return axios
    .post(url, JSON.stringify(values), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw new Error(error.message);
    });
}

// Getting the user from Google with the code
app.get(`/${redirectURI}`, async(req, res) => {
  const code = req.query.code;

  const { id_token, access_token } = await getTokens({
    code,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `http://localhost:5000/${redirectURI}`,
  });


  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error('Failed to fetch user');
      throw new Error(error.message);
    });

  const token = jwt.sign(googleUser, process.env.JWT_SECRET_KEY);
  console.log('tokennn', token);
  res.cookie(process.env.COOKIE_NAME, token, {
    maxAge: 900000,
    httpOnly: true,
    secure: false,
  });

  res.redirect('http://localhost:3000');
});

// Getting the current user
app.get('/auth/me', (req, res) => {
  console.log('get me');
  try {
    const decoded = jwt.verify(req.cookies['auth_google'], process.env.JWT_SECRET_KEY);
    console.log('decoded', decoded);
    return res.send(decoded);
  } catch (err) {
    console.log(err);
    res.send(null);
  }
});

