const BaseController = require("./BaseController");
const WishlistModel = require("../models/Wishlist");

class WishlistController extends BaseController {
  constructor() {
    super();
    this.index = this.index.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async index(req, res) {
    try {
      const items = await WishlistModel.getByUser(req.session.userId);
      this.render(res, "wishlist/index", {
        title: "Yêu thích",
        items,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async toggle(req, res) {
    try {
      const { productId } = req.body;
      const added = await WishlistModel.toggle(req.session.userId, productId);
      return this.json(res, {
        success: true,
        added,
        message: added ? "Đã thêm vào yêu thích ❤️" : "Đã xóa khỏi yêu thích",
      });
    } catch (error) {
      return this.json(res, { success: false, message: error.message }, 500);
    }
  }
}

module.exports = new WishlistController();