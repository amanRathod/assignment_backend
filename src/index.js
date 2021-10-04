/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const ConnectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function startServer() {
  const app = express();

  dotenv.config();
  ConnectDB();

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/auth', require('./controller/api/v1/user/google'));
  app.use('/', require('./routes'));

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
  });
}

startServer();
