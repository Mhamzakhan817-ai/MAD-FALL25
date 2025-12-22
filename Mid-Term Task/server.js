import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect("mongodb+srv://admin:Abasyn123@cluster1.ryuntqq.mongodb.net/coffee_shop_dbase")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Schema + Model
const menuSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  inStock: Boolean,
});
const MenuItem = mongoose.model("MenuItem", menuSchema, "menu_items");

// ✅ Routes
app.get("/menu", async (req, res) => {
  const items = await MenuItem.find();
  res.json(items);
});

app.get("/menu/random", async (req, res) => {
  const inStock = await MenuItem.find({ inStock: true });
  if (inStock.length === 0)
    return res.status(404).json({ message: "No items available" });
  const randomItem = inStock[Math.floor(Math.random() * inStock.length)];
  res.json(randomItem);
});

app.listen(3000, () => console.log("☕ Server running on port 3000"));
