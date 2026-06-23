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
    this.addAddress = this.addAddress.bind(this);
    // Admin quản lý user
    this.adminUsers = this.adminUsers.bind(this);
    this.createStaff = this.createStaff.bind(this);
    this.storeStaff = this.storeStaff.bind(this);
    this.toggleActive = this.toggleActive.bind(this);
    this.changeRole = this.changeRole.bind(this);

    this.showForgotPassword = this.showForgotPassword.bind(this);
    this.processForgotPassword = this.processForgotPassword.bind(this);
    this.showResetPassword = this.showResetPassword.bind(this);
    this.processResetPassword = this.processResetPassword.bind(this);
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
      req.session.userAvatar = user.avatar;
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
      req.session.userAvatar = user.avatar;

      // Redirect theo role
      if (user.role === "admin" || (user.role && user.role.startsWith("staff_"))) return res.redirect("/admin/dashboard");
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
      const updateData = {
        name, phone,
        address: { street, city, district },
      };
      if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
      }
      await UserModel.update(req.session.userId, updateData);
      req.session.userName = name;
      if (req.file) {
        req.session.userAvatar = updateData.avatar;
      }
      this.redirect(res, "/profile", "Cập nhật hồ sơ thành công!");
    } catch (error) {
      this.handleError(res, error, "/profile");
    }
  }

  async addAddress(req, res) {
    try {
      const { name, phone, street, ward, district, city, isDefault } = req.body;
      const user = await UserModel.getById(req.session.userId);
      
      const newAddress = { name, phone, street, ward, district, city, isDefault: isDefault === "on" || isDefault === true };
      
      if (!user.addresses) {
        user.addresses = [];
      }

      // Nếu là địa chỉ đầu tiên hoặc được set làm mặc định, bỏ default các địa chỉ cũ
      if (user.addresses.length === 0 || newAddress.isDefault) {
        newAddress.isDefault = true;
        user.addresses.forEach(a => a.isDefault = false);
      }
      
      user.addresses.push(newAddress);
      await user.save();
      
      // Return JSON nếu là request fetch
      if (req.xhr || req.accepts('json')) {
        return res.json({ success: true, addresses: user.addresses });
      }
      
      this.redirect(res, "/checkout", "Đã lưu địa chỉ mới!");
    } catch (error) {
      console.error("Lỗi addAddress:", error);
      if (req.xhr || req.accepts('json')) {
        return res.status(500).json({ success: false, message: error.message });
      }
      this.handleError(res, error, "/checkout");
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
      const { name, email, password, role } = req.body;
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        req.flash("error", "Email đã tồn tại!");
        return res.redirect("/admin/users/create-staff");
      }
      const allowedRoles = ["staff_cskh", "staff_order", "staff_content"];
      const staffRole = allowedRoles.includes(role) ? role : "staff_cskh";
      await UserModel.create({ name, email, password, role: staffRole });
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

  // Quên mật khẩu - Hiển thị form
  showForgotPassword(req, res) {
    this.render(res, "auth/forgot-password", { title: "Quên mật khẩu" });
  }

  // Quên mật khẩu - Xử lý gửi email
  async processForgotPassword(req, res) {
    try {
      const crypto = require("crypto");
      const sendEmail = require("../utils/mailer");
      const user = await UserModel.findByEmail(req.body.email);
      if (!user) {
        req.flash("error", "Email không tồn tại trong hệ thống.");
        return res.redirect("/forgot-password");
      }

      // Sinh token
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
      await user.save();

      // Tạo link khôi phục
      const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${token}`;
      const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu khôi phục mật khẩu.\n\nVui lòng click vào đường link sau để đặt lại mật khẩu của bạn:\n\n${resetUrl}\n\nNếu bạn không yêu cầu, vui lòng bỏ qua email này.`;

      await sendEmail({
        email: user.email,
        subject: "Khôi phục mật khẩu - AnVietHome",
        message
      });

      this.redirect(res, "/login", `Thành công! [DÀNH CHO TEST] Bạn hãy copy đường link sau dán vào trình duyệt để đổi mật khẩu: ${resetUrl}`);
    } catch (error) {
      this.handleError(res, error, "/forgot-password");
    }
  }

  // Đặt lại mật khẩu - Hiển thị form
  async showResetPassword(req, res) {
    try {
      const user = await UserModel.schema.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if (!user) {
        req.flash("error", "Token không hợp lệ hoặc đã hết hạn.");
        return res.redirect("/forgot-password");
      }
      this.render(res, "auth/reset-password", { title: "Đặt lại mật khẩu", token: req.params.token });
    } catch (error) {
      this.handleError(res, error, "/forgot-password");
    }
  }

  // Đặt lại mật khẩu - Xử lý cập nhật
  async processResetPassword(req, res) {
    try {
      if (req.body.password !== req.body.confirmPassword) {
        req.flash("error", "Mật khẩu không khớp.");
        return res.redirect(`/reset-password/${req.params.token}`);
      }

      const user = await UserModel.schema.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        req.flash("error", "Token không hợp lệ hoặc đã hết hạn.");
        return res.redirect("/forgot-password");
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      this.redirect(res, "/login", "Mật khẩu đã được cập nhật! Vui lòng đăng nhập.");
    } catch (error) {
      this.handleError(res, error, `/reset-password/${req.params.token}`);
    }
  }
}

module.exports = new UserController();