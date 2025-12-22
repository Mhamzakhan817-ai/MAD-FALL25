const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    unit: {
      type: String,
      enum: ["yard", "feet"],
      default: "yard",
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [cartItemSchema],
  },
  { timestamps: true }
);

/* ------------------------------
   AUTO POPULATE PRODUCT DETAILS
--------------------------------*/
function autoPopulate(next) {
  this.populate("items.product");
  next();
}

cartSchema.pre("find", autoPopulate);
cartSchema.pre("findOne", autoPopulate);
cartSchema.pre("findOneAndUpdate", autoPopulate);

/* ------------------------------
   FORMAT RESPONSE FOR FRONTEND
--------------------------------*/
cartSchema.methods.toJSON = function () {
  return {
    cart: {
      _id: this._id,
      user: this.user,
      items: this.items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    },
  };
};

module.exports = mongoose.model("Cart", cartSchema);
