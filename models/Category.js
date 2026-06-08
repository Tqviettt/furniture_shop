const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Slug danh mục là bắt buộc"],
      trim: true,
      unique: true,
    },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategorySchema = mongoose.model("Category", categorySchema);

class CategoryModel extends BaseModel {
  constructor() {
    super(CategorySchema);
  }

  async getActiveCategories() {
    const categories = await this.getAll({ isActive: true }, { sort: { name: 1 } });
    
    // Đẩy danh mục "Khác" xuống cuối cùng
    const khacIndex = categories.findIndex(c => c.slug === 'khac');
    if (khacIndex > -1) {
      const khacCat = categories.splice(khacIndex, 1)[0];
      categories.push(khacCat);
    }
    
    return categories;
  }
}

module.exports = new CategoryModel();
