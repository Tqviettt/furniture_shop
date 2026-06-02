const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
  discountValue: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const CouponSchema = mongoose.model("Coupon", couponSchema);

class CouponModel extends BaseModel {
  constructor() {
    super(CouponSchema);
  }

  async findByCode(code) {
    return await this.schema.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
  }

  async validate(code, orderTotal) {
    const coupon = await this.findByCode(code);
    if (!coupon) return { valid: false, message: "Mã giảm giá không tồn tại!" };
    if (coupon.usedCount >= coupon.maxUses)
      return { valid: false, message: "Mã giảm giá đã hết lượt sử dụng!" };
    if (coupon.expiryDate && new Date() > coupon.expiryDate)
      return { valid: false, message: "Mã giảm giá đã hết hạn!" };
    if (orderTotal < coupon.minOrder)
      return { valid: false, message: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ!` };

    const discount = coupon.discountType === "percent"
      ? Math.round(orderTotal * coupon.discountValue / 100)
      : coupon.discountValue;

    return { valid: true, coupon, discount, message: `Giảm ${discount.toLocaleString('vi-VN')}đ!` };
  }

  async use(code) {
    await this.schema.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  }
}

module.exports = new CouponModel();