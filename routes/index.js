const { Router } = require("express");
const pollController = require("../controllers/pollController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = Router();

router.get("/", pollController.getPolls);
router.get("/create", authController.isLoggedIn, pollController.createForm);
router.post("/create", authController.isLoggedIn, pollController.createPoll);
router.get("/polls", pollController.getPolls);
router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.post("/logout", authController.isLoggedIn, authController.logout);
router.get("/register", userController.registerForm);
router.post("/register", userController.validateRegister, userController.register, authController.login);
router.get("/poll/:id", pollController.getPoll);
router.post("/poll/:id/update", authController.isLoggedIn, pollController.addOption);
router.get("/votes", authController.isLoggedIn, userController.getVotes);
router.post("/vote/:id", authController.isLoggedIn, pollController.castVote);

module.exports = router;
