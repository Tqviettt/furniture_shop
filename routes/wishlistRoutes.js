const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const WishlistController = require("../controllers/WishlistController");

router.get("/", auth.isAuthenticated, WishlistController.index);
router.post("/toggle", auth.isAuthenticated, WishlistController.toggle);

module.exports = router;