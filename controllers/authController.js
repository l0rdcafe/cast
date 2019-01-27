const passport = require("passport");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { promisify } = require("util");
const mail = require("../handlers/mail");

const User = mongoose.model("User");

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login",
  successRedirect: "/",
  successFlash: "You are now logged in"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out!");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash("error", "You must be logged in to do that");
  res.redirect("/login");
};

exports.forgot = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that email exists");
      return res.redirect("/login");
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordExpires = Date.now() + 36000000;
    await user.save();
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
      user,
      subject: "Password Reset",
      resetURL,
      filename: "password-reset"
    });
    req.flash("success", "You have been emailed a password reset link");
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.reset = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("error", "Password reset is invalid or has expired");
      return res.redirect("/login");
    }
    res.render("reset", { title: "Reset Password" });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    return next();
  }

  req.flash("error", "Passwords do not match");
  res.redirect("back");
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("error", "Password reset is invalid or has expired");
      return res.redirect("/login");
    }

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash("success", "Your password has been reset");
    res.redirect("/");
  } catch (e) {
    console.log(e);
    next(e);
  }
};
