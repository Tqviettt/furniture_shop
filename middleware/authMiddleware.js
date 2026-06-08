class AuthMiddleware {
  // Đã đăng nhập chưa
  isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) return next();
    req.flash("error", "Vui lòng đăng nhập!");
    res.redirect("/login");
  }

  // Chỉ Admin
  isAdmin(req, res, next) {
    if (req.session && req.session.userRole === "admin") return next();
    req.flash("error", "Bạn không có quyền truy cập!");
    res.redirect("/");
  }

  // Admin hoặc Nhân viên
  isStaffOrAdmin(req, res, next) {
    const role = req.session?.userRole;
    if (role === "admin" || role === "staff") return next();
    req.flash("error", "Bạn không có quyền truy cập!");
    res.redirect("/");
  }

  // Chỉ Khách hàng
  isCustomer(req, res, next) {
    if (req.session?.userRole === "customer") return next();
    req.flash("error", "Chức năng chỉ dành cho khách hàng!");
    res.redirect("/");
  }

  // Set locals cho tất cả views
  setLocals(req, res, next) {
    res.locals.currentUser = req.session.userId
      ? {
          id: req.session.userId,
          name: req.session.userName,
          role: req.session.userRole,
          avatar: (req.session.userAvatar && req.session.userAvatar !== '/images/default-avatar.png') ? req.session.userAvatar : "/images/default-avatar.svg",
        }
      : null;
    res.locals.cartCount = (req.session.cart || []).length;
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.isAdmin = req.session?.userRole === "admin";
    res.locals.isStaff = req.session?.userRole === "staff";
    res.locals.isCustomer = req.session?.userRole === "customer";
    next();
  }
}

module.exports = new AuthMiddleware();