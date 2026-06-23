const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Auth routes
router.get("/register", UserController.showRegister);
router.post("/register", UserController.register);
router.get("/login", UserController.showLogin);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

const passport = require("passport");

// Google Auth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  req.session.userId = req.user._id;
  req.session.userRole = req.user.role;
  req.session.userName = req.user.name;
  res.redirect("/");
});

// Facebook Auth
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  req.session.userId = req.user._id;
  req.session.userRole = req.user.role;
  req.session.userName = req.user.name;
  res.redirect("/");
});

// Forgot Password routes
router.get("/forgot-password", UserController.showForgotPassword);
router.post("/forgot-password", UserController.processForgotPassword);
router.get("/reset-password/:token", UserController.showResetPassword);
router.post("/reset-password/:token", UserController.processResetPassword);

// Customer
router.get("/profile", auth.isAuthenticated, UserController.profile);
router.put("/profile", auth.isAuthenticated, upload.single("avatar"), UserController.updateProfile);
router.post("/profile/addresses", auth.isAuthenticated, UserController.addAddress);

// Admin quản lý users
router.get("/admin/users", auth.isAdmin, UserController.adminUsers);
router.get("/admin/users/create-staff", auth.isAdmin, UserController.createStaff);
router.post("/admin/users/create-staff", auth.isAdmin, UserController.storeStaff);
router.put("/admin/users/:id/toggle", auth.isAdmin, UserController.toggleActive);
router.put("/admin/users/:id/role", auth.isAdmin, UserController.changeRole);

module.exports = router;