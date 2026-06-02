const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bank", "momo"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

const OrderSchema = mongoose.model("Order", orderSchema);

class OrderModel extends BaseModel {
  constructor() {
    super(OrderSchema);
  }

  async getByUser(userId) {
    return await this.getAll(
      { user: userId },
      { sort: { createdAt: -1 }, populate: "items.product" },
    );
  }

  async getOrderWithDetails(orderId) {
    return await this.schema
      .findById(orderId)
      .populate("user", "name email phone")
      .populate("items.product");
  }

  async updateStatus(orderId, status) {
    return await this.update(orderId, { orderStatus: status });
  }

  async getRevenue() {
    const result = await this.schema.aggregate([
      { $match: { orderStatus: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    return result[0]?.total || 0;
  }
}

module.exports = new OrderModel();
