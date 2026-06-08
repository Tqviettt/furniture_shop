const CategoryModel = require("../models/Category");

module.exports = async (req, res, next) => {
  try {
    const categories = await CategoryModel.getActiveCategories();
    res.locals.globalCategories = categories;
    next();
  } catch (error) {
    console.error("Lỗi lấy danh mục toàn cục:", error);
    res.locals.globalCategories = [];
    next();
  }
};
