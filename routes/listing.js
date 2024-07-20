const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
//const { isLoggedIn, validateListing, isOwner } = require('../middleware.js');
const ExpressError = require('../utils/ExpressError.js');
const listingController = require('../controllers/listings.js');
//const multer = require('multer')
//const { storage } = require('../cloudConfig.js')
//const upload = multer({ storage })
const {listingSchema }= require("../schema.js");
const listing = require("../models/listing.js");
const { isLoggedIn,validateListing,isOwner } = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });




//index route
router.get("/",wrapAsync(listingController.index));
  
  //new route
  router.get("/new",isLoggedIn,listingController.renderNewForm);
  
  
  //show route
  router.get("/:id",wrapAsync(listingController.showListing));
  
   //create route
   router.post("/",
     isLoggedIn,
     upload.single("listing[image]"),
   // validateListing,
    wrapAsync(listingController.createListing)
  );
  
   //edit route
   router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));
  
   //update route
   router.put("/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    //validateListing,
    wrapAsync(listingController.updateListing));
  
  //DELETE route
  router.delete("/:id",isLoggedIn,isOwner,
    wrapAsync(listingController.deleteListing));
  

  module.exports = router;