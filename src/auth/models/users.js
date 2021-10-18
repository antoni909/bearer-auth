'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET = process.env.SECRET;

const userSchema = (sequelize, DataTypes) => {
  
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false, },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign(
          { username: this.username },
          SECRET,
          { expiresIn: 60 }
        );
      },
      set(tokenObj){
        return jwt.sign(tokenObj, SECRET);
      }
    }
  });

  model.beforeCreate(async (input) => {

    let hashedPW = await bcrypt.hash(input.password,10);
    input.password = hashedPW;

  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {
    
    const userFromDB = await this.findOne({ where: { username } })
    const valid = await bcrypt.compare(password, userFromDB.password)

    if (valid) { return userFromDB; }
    throw new Error('auth basic, Invalid User');
  }

  // Bearer AUTH: Validating a token
  model.authenticateToken = async function (token) {
    try {
      const parseToken = jwt.verify(token, SECRET);
      const user = this.findOne({where:{ username: parseToken.username}});

      if (user) { return user; }
      throw new Error("User Not Found");
    } catch (e) {
      throw new Error(e.message)
    }
  }
  return model;
}

module.exports = userSchema;
