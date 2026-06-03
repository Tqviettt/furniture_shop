const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsController");

router.get("/", NewsController.index);
router.get("/:slug", NewsController.show);

module.exports = router;
