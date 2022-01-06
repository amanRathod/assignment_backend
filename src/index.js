
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const ConnectDB = require('./config/db');
const cookieParser = require('cookie-parser');

async function startServer() {
  const app = express();

  dotenv.config();
  ConnectDB();

  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // disable console log for production mode
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
  }

  app.use('/auth', require('./controller/api/v1/user/google'));
  app.use('/', require('./routes'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
  });
}

startServer();
