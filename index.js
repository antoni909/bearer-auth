'use strict';

require('dotenv').config();
const server = require('./src/server');
const PORT = process.env.PORT || 3001;
// Start up DB Server
const { db } = require('./src/auth/models/index.js');

db.sync()
  .then(() => {
    server.start(PORT);
  })
  .catch( console.error );

