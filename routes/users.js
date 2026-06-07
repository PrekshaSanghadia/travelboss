const express = require("express");
const router = express.Router();
const User = require("../models/users.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usersController = require("../controllers/users.js");
const users = require("../models/users.js");

router.route("/signup")
    .get(usersController.newSignupForm)
    .post(usersController.signUp);

//login route

router.route("/login")
    .get(usersController.loginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), usersController.login);  

//logout route

router.route("/logout")
    .get(usersController.logout);
//hiii

module.exports = router;