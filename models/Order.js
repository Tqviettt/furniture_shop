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

  async getRevenueLast7Days() {
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setUTCHours(0,0,0,0);
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const result = await this.schema.aggregate([
      { 
        $match: { 
          orderStatus: "delivered",
          createdAt: { $gte: dates[0] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" }
        }
      }
    ]);

    const stats = dates.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const match = result.find(r => r._id === dateString);
      return {
        date: dateString,
        revenue: match ? match.total : 0
      };
    });
    return stats;
  }

  async getOrderStatusStats() {
    return await this.schema.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getRecentOrders(limit = 5) {
    return await this.schema.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getTopSellingProducts(limit = 5) {
    return await this.schema.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          image: { $first: "$items.image" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit }
    ]);
  }
}

module.exports = new OrderModel();
