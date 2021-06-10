const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  picture: { type: String, default: "" },
  subscriptions:{type: Array,default:[]}
});

const User = mongoose.model("users", userSchema);

exports.userSchema = userSchema;
exports.User = User;
