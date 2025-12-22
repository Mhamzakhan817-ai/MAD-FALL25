const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ➕ ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, unit = "yard" } = req.body;

    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Validate product existence
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity, unit }],
      });
    } else {
      const item = cart.items.find(
        (i) =>
          i.product.toString() === productId &&
          i.unit === unit
      );

      if (item) {
        item.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, unit });
      }

      await cart.save();
    }

    res.json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📦 GET USER CART
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.json({ cart: { items: [] } });
    }

    res.json({ cart });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// ❌ REMOVE ITEM FROM CART
exports.removeItem = async (req, res) => {
  try {
    const { userId } = req.body;
    const itemId = req.params.itemId;

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items._id": itemId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      message: "Item removed",
      cart,
    });
  } catch (error) {
    console.error("REMOVE ITEM ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔄 UPDATE QUANTITY (AND UNIT IF NEEDED)
exports.updateQuantity = async (req, res) => {
  try {
    const { userId } = req.body;
    const itemId = req.params.itemId;
    const { quantity, unit } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const update = {
      "items.$.quantity": quantity,
    };

    if (unit) {
      update["items.$.unit"] = unit;
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items._id": itemId },
      { $set: update },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.json({
      message: "Cart item updated",
      cart,
    });
  } catch (error) {
    console.error("UPDATE QUANTITY ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
