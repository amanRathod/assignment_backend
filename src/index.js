const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const ConnectDB = require('./config/db');

async function startServer() {
  const app = express();

  dotenv.config();
  ConnectDB();

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
  });
}

startServer();
