const mongoose = require("mongoose");

const Poll = mongoose.model("Poll");
const User = mongoose.model("User");

exports.getPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (e) {
    next(e);
  }
};

exports.createPoll = async (req, res, next) => {
  try {
    const options = req.body.options.split("/").map(i => i.trim());
    const { title } = req.body;
    const { userId: author } = req.session;
    const fields = { title, options, author };
    const poll = new Poll(fields);
    await poll.save();
    res.status(201).json({ id: poll._id });
  } catch (e) {
    next(e);
  }
};

exports.getPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.id }).populate("author", "username");

    if (!poll) {
      return next();
    }
    res.status(200).json(poll);
  } catch (e) {
    next(e);
  }
};

exports.addOption = async (req, res, next) => {
  try {
    const poll = await Poll.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { options: req.body.newOption } },
      { new: true }
    ).populate("author", "username");
    console.log(poll);
    res.status(201).json(poll);
  } catch (e) {
    next(e);
  }
};

exports.castVote = async (req, res, next) => {
  try {
    const vote = { option: req.body.option, voter: req.session.userId };
    const poll = await Poll.findOne({ _id: req.params.id });
    const voters = poll.votes.map(v => v.voter.toString());
    const hasVoted = voters.includes(req.session.userId.toString());

    if (hasVoted) {
      return res.status(400).json({ error: "You have already voted for this poll" });
    }

    const updatedPoll = await Poll.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { votes: vote } },
      { runValidators: true, new: true }
    )
      .populate("author", "username")
      .exec();

    await User.findOneAndUpdate(
      { _id: req.session.userId },
      { $push: { votes: { option: req.body.option, poll: req.params.id } } },
      { runValidators: true, new: true }
    ).exec();
    res.status(201).json({ ...updatedPoll._doc });
  } catch (e) {
    next(e);
  }
};

exports.deletePoll = async (req, res, next) => {
  try {
    if (req.session.userId !== req.body.userId) {
      return res.status(401).json({ error: "You cannot delete this poll as you are not its author" });
    }

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(400).json({ error: "Poll does not exist" });
    }

    const votersIds = poll.votes.map(vote => vote.voter);
    await User.update({ _id: { $in: votersIds } }, { $pull: { votes: { poll: req.params.id } } }, { multi: true });
    await poll.remove();
    res.status(202).end();
  } catch (e) {
    next(e);
  }
};
