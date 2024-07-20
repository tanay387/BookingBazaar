if (process.env.NODE_ENV !== 'production') {
require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require ("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
//const mongo_url ="mongodb://127.0.0.1:27017/wanderlust";
const ejsMate = require("ejs-mate");

const {listingSchema,reviewSchema }= require("./schema.js");
const Review= require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require('./utils/ExpressError.js');
const { wrap } = require("module");
const listingsRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const db_url = process.env.ATLASDB_URL;
main()
 .then(()=>{
    console.log("connected to db");
  })
.catch((err)=>{
console.log(err);
});

async function main(){
    await mongoose.connect(db_url);
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//Mongo store session info on mogoatlus
const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
      secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60, // See below for details
});

store.on("error", () => {
  console.log("Error in MongoSession store");
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  secret: "mysecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, //cross scripting attacks
  }
};


// app.get("/",(req,res)=>{
//   res.send("hi , i am root");
//   });


app.use(session(sessionOptions));
app.use(flash());


//For passport setup
//Passport will use implementation of session it should be after session
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


  //Middleware for flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   res.locals.currUser = req.user;
  next();
});

app.get("/demouser",async(req,res)=>{

let fakeUser= new User(
{
  email : "students@gmail.com",
  username : "deltastudent"
});
let r = await User.register(fakeUser,"hellowrld");
res.send(r);
})
  

//Restructuring all routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);





 //validate data for listings
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
  } else {
      next();
  }
}

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found"));
})


// error handling
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err })
  // res.status(statusCode).send(message);
})


 

// app.get("/testListing",async (req,res)=>{
//    let samplelisting= new listing({
//     title : "my new villa",
//     description : "by the beach",
//     price : 2000,
//    location : "goa",
//    Country : "india",
// });

//   await samplelisting.save();
// console.log("sample was saved");
// res.send("successful testing");


    //});
    //7O080kV4w0MZ8Ohb

    // mongodb+srv://10ay:7O080kV4w0MZ8Ohb@cluster0.kwzuoay.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

app.listen (8080,()=>{
console.log("server is listening to port 8080");
});

