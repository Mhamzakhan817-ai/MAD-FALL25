// routes/seedRoute.js
const router = require("express").Router();
const Product = require("../models/Product");
const fabricData = require("../seeds/fabricData");

router.get("/run-seed", async (req, res) => {
  try {
    await Product.deleteMany();
    await Product.insertMany(fabricData);
    res.send("Seeding complete");
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
