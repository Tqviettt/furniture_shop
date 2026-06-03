const BaseController = require("./BaseController");
const ReviewModel = require("../models/Review");
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");

class ReviewController extends BaseController {
  constructor() {
    super();
    this.store = this.store.bind(this);
    this.destroy = this.destroy.bind(this);
    this.adminIndex = this.adminIndex.bind(this);
    this.adminDestroy = this.adminDestroy.bind(this);
  }

  async store(req, res) {
    try {
      const { productId, rating, comment, orderId } = req.body;
      const userId = req.session.userId;

      // Kiểm tra đã mua hàng chưa
      const orders = await OrderModel.getByUser(userId);
      const hasBought = orders.some(o =>
        o.items.some(i => (i.product?._id || i.product)?.toString() === productId) &&
        o.orderStatus === "delivered"
      );

      if (!hasBought) {
        req.flash("error", "Bạn cần mua sản phẩm này trước khi đánh giá!");
        return res.redirect(`/products/${productId}`);
      }

      // Kiểm tra đã đánh giá chưa
      const hasReviewed = await ReviewModel.hasUserReviewed(productId, userId);
      if (hasReviewed) {
        req.flash("error", "Bạn đã đánh giá sản phẩm này rồi!");
        return res.redirect(`/products/${productId}`);
      }

      await ReviewModel.create({
        product: productId,
        user: userId,
        userName: req.session.userName,
        rating: parseInt(rating),
        comment,
        orderId,
      });

      // Cập nhật rating trung bình sản phẩm
      const { avg, count } = await ReviewModel.getAverageRating(productId);
      await ProductModel.update(productId, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: count,
      });

      this.redirect(res, `/products/${productId}`, "Cảm ơn bạn đã đánh giá! ⭐");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const review = await ReviewModel.getById(req.params.id);
      if (!review || review.user.toString() !== req.session.userId.toString()) {
        req.flash("error", "Không có quyền xóa!");
        return res.redirect("/");
      }
      await ReviewModel.delete(req.params.id);

      // Cập nhật rating trung bình sản phẩm sau khi xóa
      const { avg, count } = await ReviewModel.getAverageRating(review.product);
      await ProductModel.update(review.product, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: count,
      });

      this.redirect(res, `/products/${review.product}`, "Đã xóa đánh giá!");
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Admin lấy danh sách đánh giá
  async adminIndex(req, res) {
    try {
      const reviews = await ReviewModel.schema.find()
        .populate("product", "name images")
        .populate("user", "name email")
        .sort({ createdAt: -1 });
      
      res.render("admin/reviews/index", {
        title: "Quản lý đánh giá",
        reviews
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Admin xóa đánh giá
  async adminDestroy(req, res) {
    try {
      const review = await ReviewModel.getById(req.params.id);
      if (review) {
        await ReviewModel.delete(req.params.id);
        const { avg, count } = await ReviewModel.getAverageRating(review.product);
        await ProductModel.update(review.product, {
          rating: Math.round(avg * 10) / 10,
          reviewCount: count,
        });
      }
      this.redirect(res, "/admin/reviews", "Đã xóa đánh giá!");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new ReviewController();