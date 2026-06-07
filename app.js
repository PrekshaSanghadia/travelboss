if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const  session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy= require("passport-local");
const User = require("./models/users.js");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");
const db_URL = process.env.ATLASDB_URL;

app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));





main().then(() => {
    console.log("db is connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(db_URL);
};

app.listen(8080, (req, res) => {
    console.log("App is listening at port 8080");
});

app.get("/", (req, res) => {
    res.send("Root is working");
});

const store = MongoStore.create({
    mongoUrl: db_URL,
    secret: process.env.SESSION_SECRET,
    touchAfter: 24*3600,
});

store.on("error", (err) => {
    console.log("Error in mongo session store", err);
});

const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "me",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });


// app.get("/testlistings", async (req, res) => {
//     let sampleListing = new Listings({
//         title: "Desiredvilla",
//         description: "Book your desired place now",
//         price: 1455,
//         location: "Shimla",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log(sampleListing);
// });

// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);

//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }
//     else{
//         next();
//     }
// }

// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);

//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }
//     else{
//         next();
//     }
// }

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((err, req, res, next) => {
    if(res.headersSent){
        return next(err);
    }
    let { status = 500, message = "Something went wrong!"} = err;
    res.status(status).render("listings/error.ejs", { message });
});