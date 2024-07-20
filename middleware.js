const listing = require('./models/listing.js');
const Review = require('./models/review.js');
const { listingSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');
const { reviewSchema } = require('./schema.js');


module.exports.isLoggedIn=(req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error","You must be logged in to create listing!");
        return res.redirect("/login");
        }
   next();
}

module.exports.isOwner = async (req, res, next) => {
    //authorization step
    let { id } = req.params;
    let list = await listing.findById(id);
    if (!list.owner.equals(res.locals.currUser._id)) {
        req.flash('error', "You are not owner of this listing")
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash('error', "You are not author of this review")
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//to save redirectUrl to locals
module.exports.saveRedirectUrl = (req, res, next) => {
    //when we login then passport clear session data. to get redirect url we need to store in locals
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body.listing);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
  }
  