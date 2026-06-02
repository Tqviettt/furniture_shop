const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController");
const auth = require("../middleware/authMiddleware");

router.get("/", CartController.index);
router.post("/add", auth.isAuthenticated, CartController.add);
router.put("/update", auth.isAuthenticated, CartController.update);
router.delete("/remove/:productId", auth.isAuthenticated, CartController.remove);
router.delete("/clear", auth.isAuthenticated, CartController.clear);

module.exports = router;