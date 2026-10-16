const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }) //destination: uploads/

router.route("/")
      .get(wrapAsync(listingController.index))
      .post(isLoggedIn("You must be logged in to create a listing!"),
       upload.single('listing[image]'),  
       validateListing, 
       wrapAsync(listingController.createListing)
   );

   //new route
router.get("/new",isLoggedIn("You must be logged in to create a listing!"),
   listingController.renderNewForm);

router.get("/search", listingController.searchListing);

router.route("/:id")
       .get(wrapAsync(listingController.showListing))
       .put(isLoggedIn("You must be logged in to edit this listing!"), 
        isOwner, 
        upload.single('listing[image]'), 
        validateListing,
        wrapAsync(listingController.updateListing)
        )
        .delete(isLoggedIn("You must be logged in to delete this listing!"),
        isOwner, 
        wrapAsync(listingController.deleteListing)
    );



//edit route
router.get("/:id/edit",isLoggedIn("You must be logged in to edit this listing!"), isOwner, 
   wrapAsync(listingController.renderEditForm)
);



module.exports = router;