const mongoose = require("mongoose");
const BaseModel = require("./BaseModel");

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    action: {
      type: String,
      enum: ["in", "out", "adjust"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Người thực hiện (admin/staff)
      required: true,
    },
  },
  { timestamps: true }
);

const InventoryLogSchema = mongoose.model("InventoryLog", inventoryLogSchema);

class InventoryLogModel extends BaseModel {
  constructor() {
    super(InventoryLogSchema);
  }

  async getLogsByProduct(productId) {
    return await this.schema
      .find({ product: productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
  }

  async getAllLogs() {
    return await this.schema
      .find()
      .populate("product", "name images price")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
  }
}

module.exports = new InventoryLogModel();
