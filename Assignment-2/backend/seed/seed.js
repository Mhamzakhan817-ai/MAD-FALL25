const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const fabricData = require("./fabricData");

connectDB();

async function seed() {
  try {
    // ❗ Safety guard
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Seeding is disabled in production");
      process.exit(1);
    }

    console.log("Clearing old fabric data...");
    await Product.deleteMany();

    console.log("Inserting new fabrics...");
    await Product.insertMany(fabricData);

    console.log("✅ Fabric seeding complete!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
