const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan")("short");
const { promisify } = require("util");
const passport = require("passport");
const flash = require("connect-flash");
const expressValidator = require("express-validator");
const uuidv1 = require("uuid/v1");

require("./models/User");
require("./models/Poll");

require("./handlers/passport");
const routes = require("./routes");
require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(morgan);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(
  session({
    secret: uuidv1(),
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

mongoose.connect(process.env.DATABASE_URL);
mongoose.Promise = global.Promise;
mongoose.connection.on("error", err => {
  console.error(err.message);
});

app.use("/", routes);

app.listen(process.env.PORT);
