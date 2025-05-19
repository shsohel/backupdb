// models/email.js
const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    Sl: Number,
    startupName: String,
    founderName: String,
    email: String,
    contact: Number,
    sectorOne: String,
    division: String,
    districtCode: String,
    emailSecond: String,
    website: String,
  },
  { collection: "email" },
); // Ensure this matches your collection name

module.exports = mongoose.model("Email", emailSchema);
