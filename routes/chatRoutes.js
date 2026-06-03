const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ChatController = require("../controllers/ChatController");

// Nhân viên xem dashboard chat
router.get("/staff", auth.isStaffOrAdmin, ChatController.staffIndex);

// Lấy danh sách tin nhắn (Cho cả KH và Nhân viên)
router.get("/messages/:roomId", auth.isAuthenticated, ChatController.getMessages);

module.exports = router;
