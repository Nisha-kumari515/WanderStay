const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("./listing/index.ejs", {allListings});
  };

module.exports.renderNewForm = (req, res) =>{
    res.render("./listing/new.ejs");
}

module.exports.showListing = async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",},}).populate("owner");
    console.log("Listing Owner:", listing.owner);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("./listing/show.ejs", {listing});
  }

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
      .send()

    let url = req.file.path;
    let filename = req.file.filename;
    let data = req.body.listing;
    if (data.image && data.image.url.trim() === "") {
        delete data.image;
    }
     const newListing = new Listing(data);
     newListing.image = { url, filename };
     newListing.owner = req.user._id;

     newListing.geometry = response.body.features[0].geometry;
     let savedListing = await newListing.save();
     console.log(savedListing);
    req.flash("success", "new Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_180,w_200");
    res.render("./listing/edit.ejs", {listing, originalImageUrl});
   }

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(
        id,
        {  ...req.body.listing }, {new: true }); 
        req.flash("success", "Listing Updated!");
    if( typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url, filename};
        await updatedListing.save();
    }
    res.redirect(`/listings/${id}`);
     }

module.exports.deleteListing = async (req, res) =>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
    }

module.exports.searchListing = async(req, res) =>{
    const {country} = req.query;
    const allListings = await Listing.find({
        country: new RegExp(country, "i") 
    });
    if(allListings.length == 0){
        req.flash("error", `No Airbnb listings found in "${country}".`);
        return res.redirect("/listings");
    }else{
       res.render("listing/index", { allListings });
    }
    
};
