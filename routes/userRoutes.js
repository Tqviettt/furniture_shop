const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const auth = require("../middleware/authMiddleware");

// Public
router.get("/register", UserController.showRegister);
router.post("/register", UserController.register);
router.get("/login", UserController.showLogin);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

// Customer
router.get("/profile", auth.isAuthenticated, UserController.profile);
router.put("/profile", auth.isAuthenticated, UserController.updateProfile);

// Admin quản lý users
router.get("/admin/users", auth.isAdmin, UserController.adminUsers);
router.get("/admin/users/create-staff", auth.isAdmin, UserController.createStaff);
router.post("/admin/users/create-staff", auth.isAdmin, UserController.storeStaff);
router.put("/admin/users/:id/toggle", auth.isAdmin, UserController.toggleActive);
router.put("/admin/users/:id/role", auth.isAdmin, UserController.changeRole);

module.exports = router;