const Order = require("../models/Order");
const Cart = require("../models/Cart");

// 🧾 CREATE ORDER (FROM CART)
exports.createOrder = async (req, res) => {
  try {
    const { userId, paymentMethod, total } = req.body;

    // 1. Get user cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Create order FROM CART (source of truth)
    const order = await Order.create({
      user: userId,
      items: cart.items.map((i) => ({
        product: i.product._id || i.product,
        quantity: i.quantity,
        unit: i.unit,
      })),
      total,
      paymentMethod,
    });

    // 3. Clear cart AFTER successful order
    cart.items = [];
    await cart.save();

    res.json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📦 GET USER ORDERS
exports.getOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
