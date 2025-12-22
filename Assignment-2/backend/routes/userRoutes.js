const express = require("express");
const router = express.Router();

const { loginUser, signupUser, toggleWishlist } = require("../controllers/userController");

router.post("/login", loginUser);
router.post("/signup", signupUser);
router.post("/wishlist", toggleWishlist);

module.exports = router;
