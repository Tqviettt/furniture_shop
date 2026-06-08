const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

// Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
    },
    description: { type: String, default: "" },
    price: { type: Number, required: [true, "Giá là bắt buộc"], min: 0 },
    salePrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: [true, "Danh mục là bắt buộc"],
      trim: true
    },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    material: { type: String, default: "" },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
    },
    isActive: { type: Boolean, default: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Admin thêm thì tự approved
    },
    approvalNote: { type: String, default: "" }, // Lý do từ chối
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Text search index
productSchema.index({ name: "text", description: "text" });

const ProductSchema = mongoose.model("Product", productSchema);

// Model class kế thừa BaseModel
class ProductModel extends BaseModel {
  constructor() {
    super(ProductSchema);
  }

  // Lấy sản phẩm active
  async getActiveProducts(options = {}) {
    return await this.getAll(
      {
        isActive: true,
        approvalStatus: "approved",
      },
      options,
    );
  }

  // Lấy theo danh mục
  async getByCategory(category, options = {}) {
    return await this.getAll({ category, isActive: true }, options);
  }

  // Tìm kiếm theo tên
  async searchProducts(keyword) {
    return await this.schema.find({
      $text: { $search: keyword },
      isActive: true,
    });
  }

  // Lấy sản phẩm đang sale
  async getSaleProducts() {
    return await this.getAll({ salePrice: { $gt: 0 }, isActive: true });
  }

  // Phân trang
  async getPaginated(page = 1, limit = 12, filter = {}) {
    const skip = (page - 1) * limit;
    const total = await this.count({ ...filter, isActive: true });
    const products = await this.getAll(
      { ...filter, isActive: true },
      { limit, skip },
    );
    return {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}

module.exports = new ProductModel();
