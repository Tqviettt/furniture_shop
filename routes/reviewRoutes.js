const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ReviewController = require("../controllers/ReviewController");

router.post("/", auth.isAuthenticated, ReviewController.store);
router.delete("/:id", auth.isAuthenticated, ReviewController.destroy);

module.exports = router;