const BaseController = require("./BaseController");
const ProductModel = require("../models/Product");

class CartController extends BaseController {
  constructor() {
    super();
    this.index = this.index.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.clear = this.clear.bind(this);
  }

  // Lấy giỏ hàng từ session
  getCart(req) {
    return req.session.cart || [];
  }

  // Tính tổng tiền
  calculateTotal(cart) {
    return cart.reduce((sum, item) => {
      const price = item.salePrice > 0 ? item.salePrice : item.price;
      return sum + price * item.quantity;
    }, 0);
  }

  // GET /cart
  async index(req, res) {
    try {
      const cart = this.getCart(req);
      const total = this.calculateTotal(cart);
      this.render(res, "cart/index", {
        title: "Giỏ hàng",
        cart,
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /cart/add
  async add(req, res) {
    try {
      if (!req.session.userId) {
      return this.json(res, { 
        success: false, 
        message: "Vui lòng đăng nhập!" 
      }, 401);
    }
      const { productId, quantity = 1 } = req.body;
      const product = await ProductModel.getById(productId);

      if (!product) {
        return this.json(res, { success: false, message: "Sản phẩm không tồn tại" }, 404);
      }

      if (product.stock < quantity) {
        return this.json(res, { success: false, message: "Không đủ hàng trong kho" }, 400);
      }

      const cart = this.getCart(req);
      const existingIndex = cart.findIndex(
        (i) => i.productId.toString() === productId
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += parseInt(quantity);
      } else {
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice || 0,
          image: product.images[0] || "/images/no-image.png",
          quantity: parseInt(quantity),
        });
      }

      req.session.cart = cart;
      const total = this.calculateTotal(cart);

      return this.json(res, {
        success: true,
        message: "Thêm vào giỏ hàng thành công!",
        cartCount: cart.length,
        total,
      });
    } catch (error) {
      return this.json(res, { success: false, message: error.message }, 500);
    }
  }

  // PUT /cart/update
  update(req, res) {
    try {
      const { productId, quantity } = req.body;
      const cart = this.getCart(req);
      const index = cart.findIndex((i) => i.productId.toString() === productId);

      if (index > -1) {
        if (parseInt(quantity) <= 0) {
          cart.splice(index, 1);
        } else {
          cart[index].quantity = parseInt(quantity);
        }
      }

      req.session.cart = cart;
      const total = this.calculateTotal(cart);

      return this.json(res, { success: true, cart, total });
    } catch (error) {
      return this.json(res, { success: false, message: error.message }, 500);
    }
  }

  // DELETE /cart/remove/:productId
  remove(req, res) {
    try {
      const { productId } = req.params;
      let cart = this.getCart(req);
      cart = cart.filter((i) => i.productId.toString() !== productId);
      req.session.cart = cart;
      this.redirect(res, "/cart", "Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      this.handleError(res, error, "/cart");
    }
  }

  // DELETE /cart/clear
  clear(req, res) {
    req.session.cart = [];
    this.redirect(res, "/cart", "Đã xóa toàn bộ giỏ hàng!");
  }
}

module.exports = new CartController();