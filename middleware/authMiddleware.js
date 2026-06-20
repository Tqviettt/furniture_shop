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
    if (role === "admin" || (role && role.startsWith("staff_"))) return next();
    req.flash("error", "Bạn không có quyền truy cập!");
    res.redirect("/");
  }

  isStaffCSKH(req, res, next) {
    const role = req.session?.userRole;
    if (role === "admin" || role === "staff_cskh") return next();
    req.flash("error", "Chỉ bộ phận CSKH có quyền truy cập!");
    res.redirect("/admin/dashboard");
  }

  isStaffOrder(req, res, next) {
    const role = req.session?.userRole;
    if (role === "admin" || role === "staff_order") return next();
    req.flash("error", "Chỉ bộ phận Xử lý đơn hàng có quyền truy cập!");
    res.redirect("/admin/dashboard");
  }

  isStaffContent(req, res, next) {
    const role = req.session?.userRole;
    if (role === "admin" || role === "staff_content") return next();
    req.flash("error", "Chỉ bộ phận Nội dung & Kho có quyền truy cập!");
    res.redirect("/admin/dashboard");
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
    res.locals.isStaff = req.session?.userRole && req.session.userRole.startsWith("staff_");
    res.locals.isStaffCSKH = req.session?.userRole === "admin" || req.session?.userRole === "staff_cskh";
    res.locals.isStaffOrder = req.session?.userRole === "admin" || req.session?.userRole === "staff_order";
    res.locals.isStaffContent = req.session?.userRole === "admin" || req.session?.userRole === "staff_content";
    res.locals.isCustomer = req.session?.userRole === "customer";
    next();
  }
}

module.exports = new AuthMiddleware();