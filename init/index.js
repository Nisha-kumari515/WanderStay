const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});

console.log("MAP_TOKEN:", process.env.MAP_TOKEN);

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() =>{
    console.log("connected DB");
}).catch((err) =>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const updatedData = [];

    for (let obj of initData.data) {

        const response = await geocodingClient
            .forwardGeocode({
                query: `${obj.location}, ${obj.country}`,
                limit: 1,
            })
            .send();

        obj.owner = "69f34b58758939b8b9947c62";

        if (response.body.features.length > 0) {
            obj.geometry = response.body.features[0].geometry;
        } else {
            console.log(`Location not found: ${obj.location}, ${obj.country}`);
        continue;
}

        updatedData.push(obj);
    }

    await Listing.insertMany(updatedData);

    console.log("Data initialized with geometry.");
};

initDB();
