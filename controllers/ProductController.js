const BaseController = require("./BaseController");
const ProductModel = require("../models/Product");

class ProductController extends BaseController {
  constructor() {
    super();
    // Bind methods để dùng trong routes
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
    this.store = this.store.bind(this);
    this.edit = this.edit.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
    this.search = this.search.bind(this);
    this.getByCategory = this.getByCategory.bind(this);
  }

  // GET /products
  async index(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const category = req.query.category || null;
      const minPrice = req.query.minPrice || null;
      const maxPrice = req.query.maxPrice || null;
      const material = req.query.material || null;
      const sort = req.query.sort || "newest";
      const q = req.query.q || "";

      // Xây dựng filter
      const filter = { isActive: true, approvalStatus: "approved" };
      if (q) filter.$text = { $search: q };
      if (category) filter.category = category;
      if (material) {
        let regexStr = "";
        switch(material) {
          case "go": regexStr = "gỗ"; break;
          case "vai": regexStr = "vải|nỉ"; break;
          case "da": regexStr = "da"; break;
          case "sat": regexStr = "sắt|kim loại"; break;
          case "nhua": regexStr = "nhựa"; break;
          default: regexStr = material;
        }
        filter.material = { $regex: regexStr, $options: "i" };
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseInt(minPrice);
        if (maxPrice) filter.price.$lte = parseInt(maxPrice);
      }

      // Xây dựng sort
      let sortOption = { createdAt: -1 };
      if (sort === "price_asc") sortOption = { price: 1 };
      if (sort === "price_desc") sortOption = { price: -1 };
      if (sort === "best_seller") sortOption = { reviewCount: -1 };

      const limit = 12;
      const skip = (page - 1) * limit;
      const total = await ProductModel.count(filter);
      const products = await ProductModel.getAll(filter, {
        sort: sortOption,
        limit,
        skip,
      });

      this.render(res, "products/index", {
        title: "Sản phẩm",
        products,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        category,
        minPrice,
        maxPrice,
        material,
        sort,
        q,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /products/:id
  async show(req, res) {
  try {
    const ReviewModel = require("../models/Review");
    const product = await ProductModel.getById(req.params.id);
    if (!product) {
      req.flash("error", "Sản phẩm không tồn tại!");
      return res.redirect("/products");
    }

    const related = await ProductModel.getByCategory(product.category, { limit: 4 });
    const reviews = await ReviewModel.getByProduct(req.params.id);

    // Kiểm tra user đã mua và đánh giá chưa
    let canReview = false;
    let hasReviewed = false;
    if (req.session.userId) {
      const OrderModel = require("../models/Order");
      const orders = await OrderModel.getByUser(req.session.userId);
      canReview = orders.some(o =>
        o.items.some(i => (i.product?._id || i.product)?.toString() === req.params.id) &&
        o.orderStatus === "delivered"
      );
      hasReviewed = await ReviewModel.hasUserReviewed(req.params.id, req.session.userId);
    }

    this.render(res, "products/show", {
      title: product.name,
      product,
      related: related.filter(p => p._id.toString() !== product._id.toString()),
      reviews,
      canReview,
      hasReviewed,
    });
  } catch (error) {
    this.handleError(res, error, "/products");
  }
}

  // GET /admin/products/create
  async create(req, res) {
    const CategoryModel = require("../models/Category");
    const categories = await CategoryModel.getActiveCategories();
    const isStaff = req.session.userRole === "staff";
    this.render(res, "admin/products/create", {
      title: "Thêm sản phẩm",
      categories,
      formAction: isStaff ? "/staff/products" : "/admin/products",
    });
  }

  // POST /admin/products
  async store(req, res) {
    try {
      const errors = this.validate(req.body, ["name", "price", "category"]);
      if (errors.length > 0) {
        req.flash("error", errors.join(", "));
        const back =
          req.session.userRole === "staff"
            ? "/staff/products/create"
            : "/admin/products/create";
        return res.redirect(back);
      }

      const images = req.files
        ? req.files.map((f) => `/uploads/${f.filename}`)
        : [];

      // Nhân viên thêm → pending, Admin thêm → approved
      const approvalStatus =
        req.session.userRole === "staff" ? "pending" : "approved";

      await ProductModel.create({ ...req.body, images, approvalStatus });

      if (req.session.userRole === "staff") {
        this.redirect(
          res,
          "/staff/products",
          "Đã gửi yêu cầu thêm sản phẩm! Chờ Admin phê duyệt ",
        );
      } else {
        this.redirect(res, "/admin/products", "Thêm sản phẩm thành công!");
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const images = req.files?.length
        ? req.files.map((f) => `/uploads/${f.filename}`)
        : undefined;

      const updateData = { ...req.body };
      if (images) updateData.images = images;

      // Nhân viên sửa → pending lại, chờ duyệt
      if (req.session.userRole === "staff") {
        updateData.approvalStatus = "pending";
      }

      await ProductModel.update(req.params.id, updateData);

      if (req.session.userRole === "staff") {
        this.redirect(
          res,
          "/staff/products",
          "Đã gửi yêu cầu sửa sản phẩm! Chờ Admin phê duyệt ⏳",
        );
      } else {
        this.redirect(res, "/admin/products", "Cập nhật thành công!");
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /admin/products/:id/edit
  async edit(req, res) {
    try {
      const product = await ProductModel.getById(req.params.id);
      if (!product) {
        req.flash("error", "Sản phẩm không tồn tại!");
        return res.redirect("/admin/products");
      }
      const CategoryModel = require("../models/Category");
      const categories = await CategoryModel.getActiveCategories();
      this.render(res, "admin/products/edit", {
        title: "Sửa sản phẩm",
        product,
        categories,
      });
    } catch (error) {
      this.handleError(res, error, "/admin/products");
    }
  }



  // DELETE /admin/products/:id
  async destroy(req, res) {
    try {
      await ProductModel.delete(req.params.id);
      this.redirect(res, "/admin/products", "Xóa sản phẩm thành công!");
    } catch (error) {
      this.handleError(res, error, "/admin/products");
    }
  }

  // GET /products/search?q=sofa
  async search(req, res) {
    res.redirect(`/products?q=${req.query.q || ""}`);
  }

  // GET /products/category/:cat
  async getByCategory(req, res) {
    res.redirect(`/products?category=${req.params.cat}`);
  }
}

module.exports = new ProductController();
