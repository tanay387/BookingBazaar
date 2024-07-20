const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require("../middleware.js")
const userController = require('../controllers/users.js');
//Signup routes
router.route('/signup')
    .get(userController.renderSignupForm)
    .post(wrapAsync( userController.signup));


    //Login routes
router.route('/login')
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    wrapAsync(userController.login)
);



//LogOut routes
//Passport has inbuild function for logout
router.get('/logout', userController.logout);

module.exports = router;



   




























module.exports = router;