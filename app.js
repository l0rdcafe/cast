const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan")("short");
const path = require("path");
const expressValidator = require("express-validator");
const sessionStore = require("./sessions/session_store");
require("./models/User");
require("./models/Poll");
const routes = require("./routes");
require("dotenv").config();

const app = express();

app.use(morgan);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client/build")));

app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore
  })
);

app.use(expressValidator());
app.use("/", routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json(err.message);
  next();
});

mongoose.connect(process.env.PROD_MONGODB);
mongoose.Promise = global.Promise;
mongoose.connection.on("error", err => {
  console.error(err.message);
});

app.listen(process.env.PORT);
