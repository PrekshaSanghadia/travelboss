const User = require("../models/users");

module.exports.newSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = async(req, res) => {
    try{
        let {email, username, password} = req.body;
        const newUser = new User({ email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.logIn(registeredUser, (err) => {
            if((err) => {
                return next(err);
            });
            req.flash("success", "welcome to travelboss!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to travelboss");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "user logged out!");
        res.redirect("/listings");
    });
};