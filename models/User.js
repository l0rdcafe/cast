const mongoose = require("mongoose");
const validator = require("validator");
const passportLocalMongoose = require("passport-local-mongoose");
const mongodbErrorHandler = require("mongoose-mongodb-errors");

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: "Please supply a username",
    validate: [validator.isAlphanumeric, "Invalid Username"]
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please supply an email address"
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  votes: [{ option: String, poll: { type: mongoose.Schema.ObjectId, ref: "Poll" } }]
});

userSchema.plugin(passportLocalMongoose, { usernameField: "username" });
userSchema.statics.registerAsync = function(data, password) {
  return new Promise((resolve, reject) => {
    this.register(data, password, (err, user) => {
      if (err) {
        return reject(err);
      }
      resolve(user);
    });
  });
};
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User", userSchema);
