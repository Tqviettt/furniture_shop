const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ProductController = require("../controllers/ProductController");
const OrderController = require("../controllers/OrderController");
const UserController = require("../controllers/UserController");
const NewsController = require("../controllers/NewsController");
const ReviewController = require("../controllers/ReviewController");
const ProductModel = require("../models/Product");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Dashboard
router.get("/dashboard", auth.isAdmin, async (req, res) => {
  const UserModel = require("../models/User");
  const OrderModel = require("../models/Order");

  const [totalProducts, totalUsers, totalOrders, revenue] = await Promise.all([
    ProductModel.count(),
    UserModel.count(),
    OrderModel.count(),
    OrderModel.getRevenue(),
  ]);

  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    stats: { totalProducts, totalUsers, totalOrders, revenue },
  });
});

// Sản phẩm
router.get("/products", auth.isAdmin, async (req, res) => {
  const products = await ProductModel.getAll();
  res.render("admin/products/index", { title: "Quản lý sản phẩm", products });
});
router.get("/products/create", auth.isAdmin, ProductController.create);
router.post(
  "/products",
  auth.isAdmin,
  upload.array("images", 5),
  ProductController.store,
);
router.get("/products/:id/edit", auth.isAdmin, ProductController.edit);
router.put(
  "/products/:id",
  auth.isAdmin,
  upload.array("images", 5),
  ProductController.update,
);
router.delete("/products/:id", auth.isAdmin, ProductController.destroy);

// Phê duyệt sản phẩm
router.put("/products/:id/approve", auth.isAdmin, async (req, res) => {
  await ProductModel.update(req.params.id, {
    approvalStatus: "approved",
    isActive: true,
  });
  req.flash("success", "Đã phê duyệt sản phẩm!");
  res.redirect("/admin/products");
});

// Từ chối sản phẩm
router.put("/products/:id/reject", auth.isAdmin, async (req, res) => {
  await ProductModel.update(req.params.id, {
    approvalStatus: "rejected",
    isActive: false,
    approvalNote: req.body.note || "Không đạt yêu cầu",
  });
  req.flash("success", "Đã từ chối sản phẩm!");
  res.redirect("/admin/products");
});

// Đơn hàngmkdir public\uploadsmkdir public\uploads
router.get("/orders", auth.isAdmin, OrderController.adminOrders);
router.put("/orders/:id/status", auth.isAdmin, OrderController.updateStatus);

// Người dùng
router.get("/users", auth.isAdmin, UserController.adminUsers);
router.get("/users/create-staff", auth.isAdmin, UserController.createStaff);
router.post("/users/create-staff", auth.isAdmin, UserController.storeStaff);
router.put("/users/:id/toggle", auth.isAdmin, UserController.toggleActive);
router.put("/users/:id/role", auth.isAdmin, UserController.changeRole);

// Đánh giá
router.get("/reviews", auth.isAdmin, ReviewController.adminIndex);
router.delete("/reviews/:id", auth.isAdmin, ReviewController.adminDestroy);

// Tin tức
router.get("/news", auth.isAdmin, NewsController.adminIndex);
router.get("/news/create", auth.isAdmin, NewsController.create);
router.post("/news", auth.isAdmin, upload.single("image"), NewsController.store);
router.get("/news/:id/edit", auth.isAdmin, NewsController.edit);
router.put("/news/:id", auth.isAdmin, upload.single("image"), NewsController.update);
router.delete("/news/:id", auth.isAdmin, NewsController.destroy);

module.exports = router;
