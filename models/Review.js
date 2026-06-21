const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
}, { timestamps: true });

const ReviewSchema = mongoose.model("Review", reviewSchema);

class ReviewModel extends BaseModel {
  constructor() {
    super(ReviewSchema);
  }

  async getByProduct(productId) {
    return await this.schema
      .find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
  }

  async getAverageRating(productId) {
    const result = await this.schema.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    return result[0] || { avg: 0, count: 0 };
  }

  async hasUserReviewed(productId, userId) {
    const review = await this.schema.findOne({ product: productId, user: userId });
    return !!review;
  }
}

module.exports = new ReviewModel();