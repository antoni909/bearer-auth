'use strict';

const express = require('express');
const authRouter = express.Router();

const { users } = require('./models/index.js');
const basicAuth = require('./middleware/basic.js')
const bearerAuth = require('./middleware/bearer.js')

authRouter.post('/signup', async (req, res, next) => {
  try {
    let input = {
      username: req.body.username,
      password: req.body.password,
    }
    let userRecord = await users.create(input);
    
    const output = {
      user: userRecord,
      // token: userRecord.token
    };
    res.status(200).json(output);
  } catch (e) {
      console.log('route ouput e:',e)
  }
});

authRouter.post('/signin', basicAuth, (req, res) => {
  const info = {
    user: req.user,
    token: req.user.token
  };
  res.status(200).json(info);
});

authRouter.get('/users', bearerAuth, async (req, res) => {

  const dbUsers = await users.findAll();
  const list = dbUsers.map(user => user.username);
  res.status(200).json(list);

});

authRouter.get('/secret', bearerAuth, async (req, res) => {
  res.status(200).send("Welcome to the secret area!")
});

module.exports = authRouter;
