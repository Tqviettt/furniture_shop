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

      // Xây dựng filter
      const filter = { isActive: true, approvalStatus: "approved" };
      if (category) filter.category = category;
      if (material) filter.material = material;
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
        o.items.some(i => i.product?.toString() === req.params.id) &&
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
    const isStaff = req.session.userRole === "staff";
    this.render(res, "admin/products/create", {
      title: "Thêm sản phẩm",
      categories: ["sofa", "ban", "ghe", "giuong", "tu", "ke", "khac"],
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
      this.render(res, "admin/products/edit", {
        title: "Sửa sản phẩm",
        product,
        categories: ["sofa", "ban", "ghe", "giuong", "tu", "ke", "khac"],
      });
    } catch (error) {
      this.handleError(res, error, "/admin/products");
    }
  }

  // PUT /admin/products/:id
  async update(req, res) {
    try {
      const images = req.files?.length
        ? req.files.map((f) => `/uploads/${f.filename}`)
        : undefined;

      const updateData = { ...req.body };
      if (images) updateData.images = images;

      await ProductModel.update(req.params.id, updateData);
      this.redirect(res, "/admin/products", "Cập nhật thành công!");
    } catch (error) {
      this.handleError(res, error, `/admin/products/${req.params.id}/edit`);
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
    try {
      const keyword = req.query.q || "";
      const products = keyword
        ? await ProductModel.searchProducts(keyword)
        : [];

      this.render(res, "products/search", {
        title: `Kết quả: "${keyword}"`,
        products,
        keyword,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /products/category/:cat
  async getByCategory(req, res) {
    try {
      const products = await ProductModel.getByCategory(req.params.cat);
      this.render(res, "products/category", {
        title: `Danh mục: ${req.params.cat}`,
        products,
        category: req.params.cat,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new ProductController();
