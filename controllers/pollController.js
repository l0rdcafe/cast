const mongoose = require("mongoose");

const Poll = mongoose.model("Poll");
const User = mongoose.model("User");

exports.getPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find();
    res.render("polls", { title: "Polls", polls });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.createForm = (req, res) => {
  res.render("createPoll", { title: "Create Poll" });
};

exports.createPoll = async (req, res, next) => {
  try {
    const options = req.body.options.split("/").map(i => i.trim());
    const { title } = req.body;
    const fields = { title, options };
    const poll = await new Poll(fields).save();
    req.flash("success", `Successfully created ${poll.title}`);
    res.redirect(`/poll/${poll._id}`);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.getPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.id });

    if (!poll) {
      return next();
    }
    res.render("poll", { title: poll.title, poll });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.addOption = async (req, res, next) => {
  try {
    const poll = await Poll.findOneAndUpdate({ _id: req.params.id }, { $push: { options: req.body.add_option } });
    req.flash(
      "success",
      `Successfully added <strong>${req.body.add_option}</strong> to <strong>'${poll.title}'</strong>`
    );
    res.redirect(`/poll/${poll._id}`);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.castVote = async (req, res, next) => {
  try {
    const vote = { option: req.body.option, voter: req.user._id };
    const poll = await Poll.findOne({ _id: req.params.id });
    const voters = poll.votes.map(v => v.voter.toString());
    const hasVoted = voters.includes(req.user._id.toString());

    if (hasVoted) {
      req.flash("error", "You have already voted for this poll");
      return res.redirect(`/poll/${req.params.id}`);
    }

    const updatedPoll = await Poll.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { votes: vote } },
      { runValidators: true, new: true }
    ).exec();

    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { votes: { option: req.body.option, poll: req.params.id } } },
      { runValidators: true, new: true }
    ).exec();
    req.flash(
      "success",
      `Successfully voted for <strong>${req.body.option}</strong> in the <strong>'${updatedPoll.title}'</strong> poll`
    );
    res.redirect(`/poll/${updatedPoll._id}`);
  } catch (e) {
    console.log(e);
    next(e);
  }
};
