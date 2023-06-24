const User = require('../models/user');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const {
  generateAccesstoken,
  generateRefeshtoken,
} = require('../middlewares/jwt');
const { response } = require('express');
const jwt = require('jsonwebtoken');
const sendMail = require('../Utils/sendMail');
const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password || !lastname || !firstname)
    return res.status(400).json({
      sucess: false,
      mes: 'Missing inputs',
    });
  // const respone = await User.create(req.body);
  // return res.status(200).json({
  //   succes: respone ? true : false,
  //   respone,
  // });
  const user = await User.findOne({ email });
  if (user) {
    throw new Error('User has existed!');
  } else {
    const newUser = await User.create(req.body);
    return res.status(200).json({
      sucess: newUser ? true : false,
      mes: newUser ? 'Regiter is susscefully' : 'Something went wrong',
    });
  }
});
// Refresh token => cấp mới access token
// Access token  => xác thực người dùng ,phân quyền người dùng
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      sucess: false,
      mes: 'Missing inputs',
    });
  //plain object
  const response = await User.findOne({ email: email });

  if (response && (await response.isCorrectPassword(password))) {
    // tách password và role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject();
    //tạo assstoken
    const accessToken = generateAccesstoken(response._id, role);
    //tạo reféhtonken
    const newRefreshToken = generateRefeshtoken(response._id);
    //lưu <refesh></refesh> token vào database
    await User.findByIdAndUpdate(
      response._id,
      { newRefreshToken },
      { new: true }
    );
    //lưu refeshtoken vào cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      sucess: true,
      accessToken,
      userData, // đăng nhập thành công sẽ trả về
      // refreshToken,
    });
  } else {
    throw new Error('Invalid credentials');
  }
});

const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select('-refreshToken -password -role');
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : 'User not found ',
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies;
  // Check xem có token hay không
  if (!cookie && !cookie.refreshToken)
    throw new Error('No refresh token in cookies');
  // Check token có hợp lệ hay không

  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccesstoken(response._id, response.role)
      : 'Refresh token not matched',
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new Error('No fresher token in cookie');
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: '' },
    { new: true }
    // xoá fresh token  ở cookie trình duyệt
  );
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    mes: 'logout is done',
  });
});

//client gửi gmail
//server check email có hợp lệ không => gửi email + kèm theo link (password change token)
//client check email => click
// client gửi api kèm token
//check token có giống với token mà server gửi mail hay không
// change passwork

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) throw new Error('Missing email');
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const resetToken = user.createPasswordChangedToken();
  await user.save();
  const html = `xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn , link này sẽ hết hạn sau 15 phút kể từ bây giờ .<a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>click here</a>`;

  const data = {
    email: email,
    html,
  };
  const rs = await sendMail(data);
  return res.status(200).json({
    success: true,
    rs,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) throw new Error('Missing imputs');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error('Invalid reset token');
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpires = undefined;
  await user.save();
  return res.status(200).json({
    success: user ? true : false,
    mes: user ? 'Updated password' : 'Something went wrong',
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const response = await User.find().select('-refreshToken -password -role');
  return res.status(200).json({
    success: response ? true : false,
    users: response,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.query;
  if (!_id) throw new Error('Missing input');
  const response = await User.findByIdAndDelete(_id);
  return res.status(200).json({
    success: response ? true : false,
    deleteUser: response
      ? `User width Email ${response.emai} delete`
      : 'No user delete',
  });
});
const updateUser = asyncHandler(async (req, res) => {
  //
  const { _id } = req.user;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error('Missing input');
  const response = await User.findByIdAndDelete(_id, req.body, {
    new: true,
  }).select('-password -role');
  return res.status(200).json({
    success: response ? true : false,
    updateUser: response ? response : 'something went wrong',
  });
});
const updateUserbyAdmin = asyncHandler(async (req, res) => {
  //
  const { uid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error('Missing input');
  const response = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  }).select('-password -role');
  return res.status(200).json({
    success: response ? true : false,
    updateUser: response ? response : 'something went wrong',
  });
});
module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  updateUser,
  updateUserbyAdmin,
};
