const mongoose = require('mongoose');
mongoose.set("strictQuery",false)

const connectDB = (url) => {
  console.log(`DB connected`);
  return mongoose.connect(url);
};

module.exports = connectDB;
