const BaseController = require("./BaseController");
const UserModel = require("../models/User");

class UserController extends BaseController {
  constructor() {
    super();
    this.showRegister = this.showRegister.bind(this);
    this.register = this.register.bind(this);
    this.showLogin = this.showLogin.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.profile = this.profile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    // Admin quản lý user
    this.adminUsers = this.adminUsers.bind(this);
    this.createStaff = this.createStaff.bind(this);
    this.storeStaff = this.storeStaff.bind(this);
    this.toggleActive = this.toggleActive.bind(this);
    this.changeRole = this.changeRole.bind(this);
  }

  showRegister(req, res) {
    if (req.session.userId) return res.redirect("/");
    this.render(res, "users/register", { title: "Đăng ký" });
  }

  async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        req.flash("error", "Mật khẩu không khớp!");
        return res.redirect("/register");
      }
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        req.flash("error", "Email đã được sử dụng!");
        return res.redirect("/register");
      }
      // Đăng ký mặc định là customer
      const user = await UserModel.create({ name, email, password, role: "customer" });
      req.session.userId = user._id;
      req.session.userName = user.name;
      req.session.userRole = user.role;
      this.redirect(res, "/", "Đăng ký thành công! Chào mừng bạn 🎉");
    } catch (error) {
      this.handleError(res, error, "/register");
    }
  }

  showLogin(req, res) {
    if (req.session.userId) return res.redirect("/");
    this.render(res, "users/login", { title: "Đăng nhập" });
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user) {
        req.flash("error", "Email không tồn tại!");
        return res.redirect("/login");
      }
      if (!user.isActive) {
        req.flash("error", "Tài khoản đã bị khóa!");
        return res.redirect("/login");
      }
      const isValid = await UserModel.validatePassword(user, password);
      if (!isValid) {
        req.flash("error", "Mật khẩu không đúng!");
        return res.redirect("/login");
      }
      req.session.userId = user._id;
      req.session.userName = user.name;
      req.session.userRole = user.role;

      // Redirect theo role
      if (user.role === "admin") return res.redirect("/admin/dashboard");
      if (user.role === "staff") return res.redirect("/staff/dashboard");
      res.redirect("/");
    } catch (error) {
      this.handleError(res, error, "/login");
    }
  }

  logout(req, res) {
    req.session.destroy();
    res.redirect("/login");
  }

  async profile(req, res) {
    try {
      const user = await UserModel.getById(req.session.userId);
      this.render(res, "users/profile", { title: "Hồ sơ", user });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, phone, street, city, district } = req.body;
      await UserModel.update(req.session.userId, {
        name, phone,
        address: { street, city, district },
      });
      req.session.userName = name;
      this.redirect(res, "/profile", "Cập nhật hồ sơ thành công!");
    } catch (error) {
      this.handleError(res, error, "/profile");
    }
  }

  // ADMIN: Xem danh sách tất cả users
  async adminUsers(req, res) {
    try {
      const customers = await UserModel.getAllCustomers();
      const staffList = await UserModel.getAllStaff();
      this.render(res, "admin/users/index", {
        title: "Quản lý người dùng",
        customers,
        staffList,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // ADMIN: Form tạo nhân viên
  createStaff(req, res) {
    this.render(res, "admin/users/create-staff", {
      title: "Tạo tài khoản nhân viên",
    });
  }

  // ADMIN: Lưu nhân viên mới
  async storeStaff(req, res) {
    try {
      const { name, email, password } = req.body;
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        req.flash("error", "Email đã tồn tại!");
        return res.redirect("/admin/users/create-staff");
      }
      await UserModel.create({ name, email, password, role: "staff" });
      this.redirect(res, "/admin/users", "Tạo tài khoản nhân viên thành công!");
    } catch (error) {
      this.handleError(res, error, "/admin/users/create-staff");
    }
  }

  // ADMIN: Khóa/mở tài khoản
  async toggleActive(req, res) {
    try {
      const user = await UserModel.getById(req.params.id);
      await UserModel.update(req.params.id, { isActive: !user.isActive });
      this.redirect(res, "/admin/users",
        user.isActive ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!"
      );
    } catch (error) {
      this.handleError(res, error, "/admin/users");
    }
  }

  // ADMIN: Đổi role
  async changeRole(req, res) {
    try {
      await UserModel.update(req.params.id, { role: req.body.role });
      this.redirect(res, "/admin/users", "Đã cập nhật vai trò!");
    } catch (error) {
      this.handleError(res, error, "/admin/users");
    }
  }
}

module.exports = new UserController();