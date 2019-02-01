const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = mongoose.model("User");

exports.validateLogin = (req, res, next) => {
  req.sanitizeBody("username");
  req.checkBody("username", "You must supply a username").notEmpty();
  req.checkBody("password", "Password cannot be blank").notEmpty();
  req.sanitizeBody("password");

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json(errors);
  }

  next();
};

exports.register = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({ email: req.body.email, username: req.body.username, password: hash });
    await user.save();
    next();
  } catch (e) {
    next(e);
  }
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("username");
  req.checkBody("username", "You must supply a username").notEmpty();
  req.checkBody("email", "That Email is not valid").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("password", "Password cannot be blank").notEmpty();
  req.checkBody("passwordConfirm", "Confirmed password cannot be blank").notEmpty();
  req.checkBody("passwordConfirm", "Your passwords do not match").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    return res.json({ errors: errors.map(err => err.msg), body: req.body });
  }
  next();
};

exports.getVotes = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.session.userId }).populate("votes.poll", "title");
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    res.status(200).json({ user });
  } catch (e) {
    next(e);
  }
};
