const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

function validOptions(val) {
  return val.length > 1;
}

const pollSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: "Please enter a poll title" },
  options: { type: [{ type: String, trim: true }], validate: [validOptions, "You must supply at least two options"] },
  votes: [{ option: String, voter: { type: mongoose.Schema.ObjectId, ref: "User" } }],
  author: { type: mongoose.Schema.ObjectId, ref: "User", required: "Poll author is required" }
});

module.exports = mongoose.model("Poll", pollSchema);
