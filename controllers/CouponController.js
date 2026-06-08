const BaseController = require("./BaseController");
const CouponModel = require("../models/Coupon");

class CouponController extends BaseController {
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
      const coupons = await CouponModel.getAll({}, { sort: { createdAt: -1 } });
      this.render(res, "admin/coupons/index", {
        title: "Quản lý Mã Giảm Giá",
        coupons,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req, res) {
    this.render(res, "admin/coupons/create", { title: "Thêm Mã Giảm Giá Mới" });
  }

  async store(req, res) {
    try {
      req.body.code = req.body.code.toUpperCase();
      req.body.isActive = req.body.isActive === 'on' || req.body.isActive === 'true';
      await CouponModel.create(req.body);
      this.redirect(res, "/admin/coupons", "Thêm mã giảm giá thành công!");
    } catch (error) {
      this.handleError(res, error, "/admin/coupons/create");
    }
  }

  async edit(req, res) {
    try {
      const coupon = await CouponModel.getById(req.params.id);
      if (!coupon) throw new Error("Không tìm thấy mã giảm giá!");
      this.render(res, "admin/coupons/edit", {
        title: "Chỉnh sửa Mã Giảm Giá",
        coupon,
      });
    } catch (error) {
      this.handleError(res, error, "/admin/coupons");
    }
  }

  async update(req, res) {
    try {
      if (req.body.code) req.body.code = req.body.code.toUpperCase();
      // Ensure boolean values are correctly parsed
      req.body.isActive = req.body.isActive === 'true' || req.body.isActive === 'on';
      await CouponModel.update(req.params.id, req.body);
      this.redirect(res, "/admin/coupons", "Cập nhật mã giảm giá thành công!");
    } catch (error) {
      this.handleError(res, error, `/admin/coupons/${req.params.id}/edit`);
    }
  }

  async destroy(req, res) {
    try {
      await CouponModel.delete(req.params.id);
      this.redirect(res, "/admin/coupons", "Xóa mã giảm giá thành công!");
    } catch (error) {
      this.handleError(res, error, "/admin/coupons");
    }
  }
}

module.exports = new CouponController();
