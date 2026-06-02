const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");

// Public routes
router.get("/", ProductController.index);
router.get("/search", ProductController.search);
router.get("/category/:cat", ProductController.getByCategory);
router.get("/:id", ProductController.show);

module.exports = router;