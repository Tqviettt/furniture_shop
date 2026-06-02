const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");
const OrderController = require("../controllers/OrderController");


// Dashboard nhân viên
router.get("/dashboard", auth.isStaffOrAdmin, async (req, res) => {
  const [totalProducts, pendingOrders] = await Promise.all([
    ProductModel.count(),
    OrderModel.count({ orderStatus: "pending" }),
  ]);
  res.render("staff/dashboard", {
    title: "Nhân Viên Dashboard",
    stats: { totalProducts, pendingOrders },
  });
});

// Nhân viên quản lý đơn hàng
router.get("/orders", auth.isStaffOrAdmin, async (req, res) => {
  const orders = await OrderModel.getAll(
    {},
    { populate: "user", sort: { createdAt: -1 } },
  );
  res.render("staff/orders/index", { title: "Quản lý đơn hàng", orders });
});
router.put(
  "/orders/:id/status",
  auth.isStaffOrAdmin,
  OrderController.updateStatus,
);

module.exports = router;
