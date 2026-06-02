const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
}, { timestamps: true });

const WishlistSchema = mongoose.model("Wishlist", wishlistSchema);

class WishlistModel extends BaseModel {
  constructor() {
    super(WishlistSchema);
  }

  async getByUser(userId) {
    return await this.schema
      .find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 });
  }

  async isWishlisted(userId, productId) {
    const item = await this.schema.findOne({ user: userId, product: productId });
    return !!item;
  }

  async toggle(userId, productId) {
    const existing = await this.schema.findOne({ user: userId, product: productId });
    if (existing) {
      await this.schema.findByIdAndDelete(existing._id);
      return false; // Đã xóa
    } else {
      await this.create({ user: userId, product: productId });
      return true; // Đã thêm
    }
  }
}

module.exports = new WishlistModel();