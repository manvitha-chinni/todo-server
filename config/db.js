const mongoose = require("mongoose");

const connectDB = async () => {
  const connectionString = process.env.DB_CONNECTION_STRING;
  console.log("connection string is ", connectionString);
  try {
    const conn = mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log(conn);
    console.log(`Successfully Connected to mongodb : ${conn.connection}`);
  } catch (error) {
    console.log("error is ", error);
    console.log("Failed to connect Mongodb exiting...");
    process.exit(555);
  }
};
module.exports = connectDB;
