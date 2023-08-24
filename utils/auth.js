const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const User = require('../models/user')

const hashPassword = async (password) => {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    return passwordHash;
};

const getTokenandID = async (username) => {
    const user = await User.findOne({ username })
    
    const userForToken = {
        username: user.username,
        id: user._id,
      }
    
      const token = jwt.sign(userForToken, process.env.SECRET)

      return [token, userForToken.id]
}

module.exports = {
    hashPassword, getTokenandID
};