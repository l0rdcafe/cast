const mongoose = require("mongoose");
const { promisify } = require("util");

const User = mongoose.model("User");

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
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
  req.checkBody("password-confirm", "Confirmed password cannot be blank").notEmpty();
  req.checkBody("password-confirm", "Your passwords do not match").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    return res.render("register", { title: "Register", body: req.body, flashes: req.flash() });
  }
  next();
};

exports.register = async (req, res, next) => {
  try {
    const user = new User({ email: req.body.email, username: req.body.username });
    await User.registerAsync(user, req.body.password);
    next();
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.getVotes = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).populate("votes.poll", "title");
    if (!user) {
      req.flash("error", "No user exists");
      return res.redirect("back");
    }

    res.render("votes", { title: "My Votes", user });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
