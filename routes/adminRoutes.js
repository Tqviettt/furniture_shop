const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ProductController = require("../controllers/ProductController");
const OrderController = require("../controllers/OrderController");
const UserController = require("../controllers/UserController");
const InvoiceController = require("../controllers/InvoiceController");
const ReportController = require("../controllers/ReportController");
const NewsController = require("../controllers/NewsController");
const ReviewController = require("../controllers/ReviewController");
const CouponController = require("../controllers/CouponController");
const CategoryController = require("../controllers/CategoryController");
const InventoryController = require("../controllers/InventoryController");
const ProductModel = require("../models/Product");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Dashboard
router.get("/dashboard", auth.isStaffOrAdmin, async (req, res) => {
  const UserModel = require("../models/User");
  const OrderModel = require("../models/Order");

  const [totalProducts, totalUsers, totalOrders, revenue, revenueChart, statusStats, topProducts, recentOrders, lowStockProducts] = await Promise.all([
    ProductModel.schema.countDocuments(),
    UserModel.schema.countDocuments(),
    OrderModel.schema.countDocuments(),
    OrderModel.getRevenue(),
    OrderModel.getRevenueLast7Days(),
    OrderModel.getOrderStatusStats(),
    OrderModel.getTopSellingProducts(5),
    OrderModel.getRecentOrders(5),
    ProductModel.schema.find({ stock: { $lte: 5 } }).select("name stock price images").limit(5).lean(),
  ]);

  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    stats: { totalProducts, totalUsers, totalOrders, revenue },
    revenueChart,
    statusStats,
    topProducts,
    recentOrders,
    lowStockProducts
  });
});

// Sản phẩm
router.get("/products", auth.isStaffContent, async (req, res) => {
  const products = await ProductModel.getAll();
  res.render("admin/products/index", { title: "Quản lý sản phẩm", products });
});
router.get("/products/create", auth.isStaffContent, ProductController.create);
router.post(
  "/products",
  auth.isStaffContent,
  upload.array("images", 5),
  ProductController.store,
);
router.get("/products/:id/edit", auth.isStaffContent, ProductController.edit);
router.put(
  "/products/:id",
  auth.isStaffContent,
  upload.array("images", 5),
  ProductController.update,
);
router.delete("/products/:id", auth.isStaffContent, ProductController.destroy);

// Phê duyệt sản phẩm
router.put("/products/:id/approve", auth.isStaffContent, async (req, res) => {
  await ProductModel.update(req.params.id, {
    approvalStatus: "approved",
    isActive: true,
  });
  req.flash("success", "Đã phê duyệt sản phẩm!");
  res.redirect("/admin/products");
});

// Từ chối sản phẩm
router.put("/products/:id/reject", auth.isStaffContent, async (req, res) => {
  await ProductModel.update(req.params.id, {
    approvalStatus: "rejected",
    isActive: false,
    approvalNote: req.body.note || "Không đạt yêu cầu",
  });
  req.flash("success", "Đã từ chối sản phẩm!");
  res.redirect("/admin/products");
});

// Đơn hàng
router.get("/orders", auth.isStaffOrder, OrderController.adminOrders);
router.put("/orders/:id/status", auth.isStaffOrder, OrderController.updateStatus);
router.get("/orders/:id/invoice", auth.isStaffOrder, InvoiceController.generateInvoice);

// Người dùng
router.get("/users", auth.isAdmin, UserController.adminUsers);
router.get("/users/create-staff", auth.isAdmin, UserController.createStaff);
router.post("/users/create-staff", auth.isAdmin, UserController.storeStaff);
router.put("/users/:id/toggle", auth.isAdmin, UserController.toggleActive);
router.put("/users/:id/role", auth.isAdmin, UserController.changeRole);

// Đánh giá
router.get("/reviews", auth.isStaffCSKH, ReviewController.adminIndex);
router.delete("/reviews/:id", auth.isStaffCSKH, ReviewController.adminDestroy);

// Mã giảm giá
router.get("/coupons", auth.isAdmin, CouponController.adminIndex);
router.get("/coupons/create", auth.isAdmin, CouponController.create);
router.post("/coupons", auth.isAdmin, CouponController.store);
router.get("/coupons/:id/edit", auth.isAdmin, CouponController.edit);
router.put("/coupons/:id", auth.isAdmin, CouponController.update);
router.delete("/coupons/:id", auth.isAdmin, CouponController.destroy);

// Danh mục
router.get("/categories", auth.isStaffContent, CategoryController.adminIndex);
router.get("/categories/create", auth.isStaffContent, CategoryController.create);
router.post("/categories", auth.isStaffContent, CategoryController.store);
router.get("/categories/:id/edit", auth.isStaffContent, CategoryController.edit);
router.put("/categories/:id", auth.isStaffContent, CategoryController.update);
router.delete("/categories/:id", auth.isStaffContent, CategoryController.destroy);

// Quản lý kho
router.get("/inventory", auth.isStaffContent, InventoryController.index);
router.post("/inventory/add", auth.isStaffContent, InventoryController.addStock);
router.get("/inventory/logs", auth.isStaffContent, InventoryController.logs);

// Tin tức
router.get("/news", auth.isStaffContent, NewsController.adminIndex);
router.get("/news/create", auth.isStaffContent, NewsController.create);
router.post("/news", auth.isStaffContent, upload.single("image"), NewsController.store);
router.get("/news/:id/edit", auth.isStaffContent, NewsController.edit);
router.put("/news/:id", auth.isStaffContent, upload.single("image"), NewsController.update);
router.delete("/news/:id", auth.isStaffContent, NewsController.destroy);

module.exports = router;
