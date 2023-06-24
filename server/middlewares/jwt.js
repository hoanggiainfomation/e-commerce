const jwt = require('jsonwebtoken');
const generateAccesstoken = (uid, role) =>
  jwt.sign({ _id: uid, role }, process.env.JWT_SECRET, {
    expiresIn: '2d',
  });
const generateRefeshtoken = (uid) =>
  jwt.sign({ _id: uid }, process.env.JWT_SECRET, { expiresIn: '7d' });



module.exports = { generateAccesstoken, generateRefeshtoken };
