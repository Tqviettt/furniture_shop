const BaseController = require("./BaseController");
const ProductModel = require("../models/Product");
const InventoryLogModel = require("../models/InventoryLog");

class InventoryController extends BaseController {
  constructor() {
    super();
    this.index = this.index.bind(this);
    this.addStock = this.addStock.bind(this);
    this.logs = this.logs.bind(this);
  }

  // GET /admin/inventory
  async index(req, res) {
    try {
      const q = req.query.q || "";
      let products;
      if (q) {
         products = await ProductModel.searchProducts(q);
      } else {
         products = await ProductModel.getAll({}, { sort: { stock: 1 } }); // Ưu tiên xếp số lượng ít lên đầu
      }
      
      this.render(res, "admin/inventory/index", {
        title: "Quản lý kho",
        products,
        q
      });
    } catch (error) {
      this.handleError(res, error, "/admin/dashboard");
    }
  }

  // POST /admin/inventory/add
  async addStock(req, res) {
    try {
      const { productId, quantity, reason } = req.body;
      const parsedQuantity = parseInt(quantity);
      if (parsedQuantity <= 0) {
        req.flash("error", "Số lượng nhập phải lớn hơn 0");
        return res.redirect("/admin/inventory");
      }

      const product = await ProductModel.getById(productId);
      if (!product) {
        req.flash("error", "Không tìm thấy sản phẩm");
        return res.redirect("/admin/inventory");
      }

      // Cập nhật số lượng
      product.stock += parsedQuantity;
      await product.save();

      // Ghi log
      await InventoryLogModel.create({
        product: productId,
        action: "in",
        quantity: parsedQuantity,
        reason: reason || "Nhập kho",
        user: req.session.userId,
      });

      this.redirect(res, "/admin/inventory", `Đã nhập thêm ${parsedQuantity} cho sản phẩm ${product.name}`);
    } catch (error) {
      this.handleError(res, error, "/admin/inventory");
    }
  }

  // GET /admin/inventory/logs
  async logs(req, res) {
    try {
      const logs = await InventoryLogModel.getAllLogs();
      this.render(res, "admin/inventory/logs", {
        title: "Lịch sử nhập xuất kho",
        logs,
      });
    } catch (error) {
      this.handleError(res, error, "/admin/inventory");
    }
  }
}

module.exports = new InventoryController();
