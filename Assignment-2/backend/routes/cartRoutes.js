const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Add (userId in URL)
router.post("/:userId/add", cartController.addToCart);

// Get cart
router.get("/:userId", cartController.getCart);

// Remove (userId in URL)
router.delete("/:userId/remove/:itemId", cartController.removeItem);

// Update quantity (userId in URL)
router.patch("/:userId/update/:itemId", cartController.updateQuantity);

module.exports = router;
