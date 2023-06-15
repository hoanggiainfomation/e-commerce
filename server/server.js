const express = require('express');
require('dotenv').config();

const app = express();

const dbConnect = require('./config/dbConnect');
const initRouter = require('./routes');

const port = process.env.PORT || 8888;
app.use(express.json()); // đọc dữ liệu từ client bằng json
app.use(express.urlencoded({ extended: true })); // đọc dữ liệu theo kiểu json object
dbConnect();
initRouter(app);

app.listen(port, () => {
  console.log('server learning' + port);
});
