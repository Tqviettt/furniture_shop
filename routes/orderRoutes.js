const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");
const auth = require("../middleware/authMiddleware");
const CouponModel = require("../models/Coupon");

router.get("/checkout", auth.isAuthenticated, OrderController.checkout);
router.post("/", auth.isAuthenticated, OrderController.placeOrder);
router.get("/my-orders", auth.isAuthenticated, OrderController.myOrders);
router.get("/:id", auth.isAuthenticated, OrderController.orderDetail);
router.put("/:id/cancel", auth.isAuthenticated, OrderController.cancelOrder);

// Admin
router.get("/admin/orders", auth.isAdmin, OrderController.adminOrders);
router.put("/admin/orders/:id/status", auth.isAdmin, OrderController.updateStatus);
router.post("/check-coupon", auth.isAuthenticated, async (req, res) => {
  const { code, total } = req.body;
  const result = await CouponModel.validate(code, parseInt(total));
  res.json(result);
});

module.exports = router;
