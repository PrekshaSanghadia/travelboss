const Listing = require("../models/listings.js");
const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = '8F6HWXMxk0WWahcisb4y';
 
module.exports.index = async (req, res) => {
   const allListings = await Listing.find();
   res.render("listings/index.ejs", { allListings });
};

module.exports.newForm = async(req, res) => {
    res.render("listings/new.ejs");
};

module.exports.searchDestinations = async(req, res) => {
    try{
        let { location } = req.query;
        let query = {};
        if(location){
            query.location = { $regex: location, $options: 'i' };
        }

        const allListings = await Listing.find(query);
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.error(err);
        res.status(500).send("Something wrong in search");
    }
}

module.exports.createListing = async (req, res, next) => {

        const newListing = new Listing(req.body.listing);
        let url = req.file.path;    
        let filename = req.file.filename;
        const geocodeResponse = await maptilerClient.geocoding.forward(req.body.listing.location, { limit: 1 });
        if(geocodeResponse.features && geocodeResponse.features.length > 0){
            newListing.geometry = geocodeResponse.features[0].geometry;
        } else {
            newListing.geometry = {
                type: "Point",
                coordinates: [72.8333, 21.1667]
                };
        }
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        await newListing.save();
        req.flash("success", "New listing added!");
        res.redirect("/listings");

};

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: ({ path: "author"})}).populate("owner");
    if(!listing){
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
     
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;    
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
   
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};