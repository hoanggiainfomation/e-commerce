const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

const sendMail = asyncHandler(async ({ email, html }) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.Email_NAME, // generated ethereal user
      pass: process.env.Email_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Cuahangdientu" <no-relply@cuahangdientu.com>', // sender address
    to: email, // list of receivers
    subject: 'Forgot password', // Subject line
    html: html, // html body
  });

  return info;
});

module.exports = sendMail;
