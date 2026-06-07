const mongoose = require("mongoose");
const Listings = require("../models/listings.js");
const initData = require("./data.js");

main().then(() => {
    console.log("db is connected");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/travelboss");
};

const initDB = async () => {
    await Listings.deleteMany();
    initData.data = initData.data.map((obj) => ({...obj, owner: "69cff9b943f8bacd0fb2aec9" }));
    await Listings.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();