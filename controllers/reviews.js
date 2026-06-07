const Review = require("../models/review.js");
const Listings = require("../models/listings"); 


module.exports.newReview = async(req, res) => {
    let listing = await Listings.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    let result = await listing.save();
    console.log(result);
    req.flash("success", "New review added!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req, res) => {
    let {id, reviewId} = req.params;
    await Listings.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};