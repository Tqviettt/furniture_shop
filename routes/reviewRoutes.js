const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const ReviewController = require("../controllers/ReviewController");

router.post("/", auth.isAuthenticated, upload.array("images", 3), ReviewController.store);
router.delete("/:id", auth.isAuthenticated, ReviewController.destroy);

module.exports = router;