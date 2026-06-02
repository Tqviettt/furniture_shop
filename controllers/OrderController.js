const BaseController = require("./BaseController");
const OrderModel = require("../models/Order");
const ProductModel = require("../models/Product");
const CouponModel = require("../models/Coupon");
const UserModel = require("../models/User");
const Mailer = require("../config/mailer");

class OrderController extends BaseController {
  constructor() {
    super();
    this.checkout = this.checkout.bind(this);
    this.placeOrder = this.placeOrder.bind(this);
    this.myOrders = this.myOrders.bind(this);
    this.orderDetail = this.orderDetail.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    // Admin
    this.adminOrders = this.adminOrders.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  // GET /checkout
  checkout(req, res) {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
      req.flash("error", "Giỏ hàng trống!");
      return res.redirect("/cart");
    }
    const total = cart.reduce((sum, item) => {
      const price = item.salePrice > 0 ? item.salePrice : item.price;
      return sum + price * item.quantity;
    }, 0);

    this.render(res, "orders/checkout", {
      title: "Thanh toán",
      cart,
      total,
      shippingFee: total > 5000000 ? 0 : 50000,
    });
  }

  // POST /orders
  async placeOrder(req, res) {
    try {
      const cart = req.session.cart || [];
      if (cart.length === 0) {
        req.flash("error", "Giỏ hàng trống!");
        return res.redirect("/cart");
      }

      const { name, phone, street, city, district, paymentMethod, note } =
        req.body;

      const subtotal = cart.reduce((sum, item) => {
        const price = item.salePrice > 0 ? item.salePrice : item.price;
        return sum + price * item.quantity;
      }, 0);
      const shippingFee = subtotal > 5000000 ? 0 : 50000;

      // Xử lý mã giảm giá
      const { couponCode } = req.body;
      let discount = 0;
      if (couponCode) {
        const couponResult = await CouponModel.validate(couponCode, subtotal);
        if (couponResult.valid) {
          discount = couponResult.discount;
          await CouponModel.use(couponCode);
        }
      }

      const order = await OrderModel.create({
        user: req.session.userId,
        items: cart.map((item) => ({
          product: item.productId,
          name: item.name,
          price: item.salePrice > 0 ? item.salePrice : item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: { name, phone, street, city, district },
        paymentMethod,
        note,
        subtotal,
        shippingFee,
        discount,
        total: subtotal + shippingFee - discount,
      });

      // Giảm stock
      for (const item of cart) {
        await ProductModel.schema.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      // Xóa giỏ hàng
      req.session.cart = [];

      // Gửi email xác nhận
      try {
        const user = await UserModel.getById(req.session.userId);
        await Mailer.sendOrderConfirmation(order, user.email);
      } catch (mailError) {
        console.log("Lỗi gửi email:", mailError.message);
      }

      this.redirect(res, `/orders/${order._id}`, "Đặt hàng thành công! ");
    } catch (error) {
      this.handleError(res, error, "/checkout");
    }
  }

  // GET /orders
  async myOrders(req, res) {
    try {
      const orders = await OrderModel.getByUser(req.session.userId);
      this.render(res, "orders/index", { title: "Đơn hàng của tôi", orders });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /orders/:id
  async orderDetail(req, res) {
    try {
      const order = await OrderModel.getOrderWithDetails(req.params.id);
      if (
        !order ||
        order.user._id.toString() !== req.session.userId.toString()
      ) {
        req.flash("error", "Không tìm thấy đơn hàng!");
        return res.redirect("/orders");
      }
      this.render(res, "orders/detail", {
        title: `Đơn hàng #${order._id}`,
        order,
      });
    } catch (error) {
      this.handleError(res, error, "/orders");
    }
  }

  // PUT /orders/:id/cancel
  async cancelOrder(req, res) {
    try {
      const order = await OrderModel.getById(req.params.id);
      if (!order || order.user.toString() !== req.session.userId.toString()) {
        req.flash("error", "Không có quyền thực hiện!");
        return res.redirect("/orders/my-orders");
      }
      if (order.orderStatus !== "pending") {
        req.flash("error", "Không thể hủy đơn hàng này!");
        return res.redirect(`/orders/${req.params.id}`);
      }
      await OrderModel.updateStatus(req.params.id, "cancelled");
      this.redirect(res, "/orders/my-orders", "Hủy đơn hàng thành công!");
    } catch (error) {
      this.handleError(res, error, "/orders/my-orders");
    }
  }
  // ADMIN: GET /admin/orders
  async adminOrders(req, res) {
    try {
      const orders = await OrderModel.getAll(
        {},
        { populate: "user", sort: { createdAt: -1 } },
      );
      const revenue = await OrderModel.getRevenue();
      this.render(res, "admin/orders/index", {
        title: "Quản lý đơn hàng",
        orders,
        revenue,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // ADMIN: PUT /admin/orders/:id/status
  async updateStatus(req, res) {
    try {
      await OrderModel.updateStatus(req.params.id, req.body.status);

      // Redirect đúng theo role
      const redirectUrl =
        req.session.userRole === "admin" ? "/admin/orders" : "/staff/orders";

      this.redirect(res, redirectUrl, "Cập nhật trạng thái thành công!");
    } catch (error) {
      const redirectUrl =
        req.session.userRole === "admin" ? "/admin/orders" : "/staff/orders";
      this.handleError(res, error, redirectUrl);
    }
  }
}

module.exports = new OrderController();
