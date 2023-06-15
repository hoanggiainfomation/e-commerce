const { default: mongoose } = require('mongoose');
mongoose.set('strictQuery', false);
const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    if (conn.connection.readyState === 1) {
      console.log('DB connnect is successfully');
    } else {
      console.log('falie');
    }
  } catch (error) {
    console.log('db fail');
    throw new Error(error);
  }
};
module.exports = dbConnect;
