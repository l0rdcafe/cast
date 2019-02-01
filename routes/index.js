const { Router } = require("express");
const pollController = require("../controllers/pollController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = Router();

router.get("/sessions", authController.isValidSession);
router.post("/create", authController.isLoggedIn, pollController.createPoll);
router.get("/polls", pollController.getPolls);
router.post("/login", userController.validateLogin, authController.login);
router.post("/logout", authController.isLoggedIn, authController.logout);
router.post("/register", userController.validateRegister, userController.register, authController.login);
router.get("/poll/:id", pollController.getPoll);
router.post("/poll/:id/update", authController.isLoggedIn, pollController.addOption);
router.get("/votes", authController.isLoggedIn, userController.getVotes);
router.post("/vote/:id", authController.isLoggedIn, pollController.castVote);
router.post("/delete/:id", authController.isLoggedIn, pollController.deletePoll);

module.exports = router;
