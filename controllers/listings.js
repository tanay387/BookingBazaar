const listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// const { listingSchema } = require('../schema.js');

module.exports.index = async (req, res) => {
    const allListings = await listing.find({});
    res.render("./listings/index.ejs", { allListings });
}

module.exports.renderNewForm = async (req, res) => {

    res.render("listings/new.ejs");
}


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const l = await listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }) //nested populate
        .populate("owner");
    if (!l) {
        req.flash("error", "dfdfddgdggggdggdg");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { l });
}



module.exports.createListing = async (req, res, next) => {
    // let result =listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error)
    //   {
    //     throw new ExpressError(400,result.error);
    //      } 
    //Geocoding
    // let response = await geocodingClient
    //     .forwardGeocode({
    //         query: req.body.listing.location,
    //         limit: 1
    //     })
    //     .send();


    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new listing(req.body.listing);
    newListing.image = { url, filename };

    //adding owner
    newListing.owner = req.user._id;
    // newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "New listing created!")
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const l = await listing.findById(id);
    let originalImageUrl = l.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { l, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    //    if(!req.body.listing){
    //   throw new ExpressError(400,"Send valid data for listing");
    //    } 
    let { id } = req.params;
    let list = await listing.findByIdAndUpdate(id, { ...req.body.listing });
    //for updating files
    if (typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        list.image = { url, filename };
        await list.save();
    }
    req.flash('success', "Details Updated!!")
    res.redirect(`/listings/${id}`);
}


module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings/"); //(`/listings/${id}`)
}