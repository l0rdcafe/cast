const mongoose = require("mongoose");
const crypto = require("crypto");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const mail = require("../handlers/mail");
const sessionStore = require("../sessions/session_store");

const User = mongoose.model("User");

exports.login = async (req, res, next) => {
  try {
    const { username, password: pw } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ error: "Username does not exist" });
    }

    const isValidPassword = await bcrypt.compare(pw, user.password);

    if (!isValidPassword) {
      return res.json({ error: "Wrong password for username" });
    }

    req.session.userId = user._id;
    sessionStore.set(req.session.id, req.session, async err => {
      if (err) {
        return next(err);
      }

      res.status(200).json({ username: user.username, id: user._id, email: user.email });
    });
  } catch (e) {
    next(e);
  }
};

exports.logout = async (req, res, next) => {
  const fakeCookie = `${req.get("Cookie")}; Path=/; HttpOnly; expires=Thu, Jan 01 1970 00:00:00 UTC;`;
  const sessionId = req.session.id;
  sessionStore.destroy(sessionId, err => {
    if (err) {
      return next(err);
    }
    res.set({ "Set-Cookie": fakeCookie });
    res.status(200).end();
  });
};

exports.isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }

  res.status(401).json({ error: "You are unauthorized to perform this action" });
};

exports.forgot = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
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
      return res.redirect("/login");
    }
    res.render("reset", { title: "Reset Password" });
  } catch (e) {
    next(e);
  }
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
    next(e);
  }
};

exports.isValidSession = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      res.status(200).json({ username: user.username, email: user.email, id: user._id });
    } else {
      res.status(404).json({});
    }
  } catch (e) {
    next(e);
  }
};
