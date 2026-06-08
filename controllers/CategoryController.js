const BaseController = require("./BaseController");
const CategoryModel = require("../models/Category");

class CategoryController extends BaseController {
  constructor() {
    super();
    this.adminIndex = this.adminIndex.bind(this);
    this.create = this.create.bind(this);
    this.store = this.store.bind(this);
    this.edit = this.edit.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  async adminIndex(req, res) {
    try {
      const categories = await CategoryModel.getAll({}, { sort: { createdAt: -1 } });
      this.render(res, "admin/categories/index", {
        title: "Quản lý Danh mục",
        categories,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req, res) {
    this.render(res, "admin/categories/create", { title: "Thêm Danh mục" });
  }

  async store(req, res) {
    try {
      req.body.isActive = req.body.isActive === 'on' || req.body.isActive === 'true';
      await CategoryModel.create(req.body);
      this.redirect(res, "/admin/categories", "Thêm danh mục thành công!");
    } catch (error) {
      this.handleError(res, error, "/admin/categories/create");
    }
  }

  async edit(req, res) {
    try {
      const category = await CategoryModel.getById(req.params.id);
      if (!category) throw new Error("Không tìm thấy danh mục!");
      this.render(res, "admin/categories/edit", {
        title: "Sửa Danh mục",
        category,
      });
    } catch (error) {
      this.handleError(res, error, "/admin/categories");
    }
  }

  async update(req, res) {
    try {
      req.body.isActive = req.body.isActive === 'on' || req.body.isActive === 'true';
      await CategoryModel.update(req.params.id, req.body);
      this.redirect(res, "/admin/categories", "Cập nhật danh mục thành công!");
    } catch (error) {
      this.handleError(res, error, `/admin/categories/${req.params.id}/edit`);
    }
  }

  async destroy(req, res) {
    try {
      await CategoryModel.delete(req.params.id);
      this.redirect(res, "/admin/categories", "Xóa danh mục thành công!");
    } catch (error) {
      this.handleError(res, error, "/admin/categories");
    }
  }
}

module.exports = new CategoryController();
