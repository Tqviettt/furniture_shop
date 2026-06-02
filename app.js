const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const db = require("./config/database");
const auth = require("./middleware/authMiddleware");

// Routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const staffRoutes = require("./routes/staffRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");     // ← THÊM
const wishlistRoutes = require("./routes/wishlistRoutes");

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/furniture_shop";

    this.initDatabase();
    this.initMiddleware();
    this.initRoutes();
    this.initErrorHandling();
  }

  async initDatabase() {
    await db.connect(this.mongoUri);
  }

  initMiddleware() {
    // Template engine
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "views"));
    this.app.use(expressLayouts);
    this.app.set("layout", "layouts/main");

    // Static files
    this.app.use(express.static(path.join(__dirname, "public")));

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Method override (PUT, DELETE từ form)
    this.app.use(methodOverride("_method"));

    // Session
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || "furniture_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 ngày
      }),
    );

    // Flash messages
    this.app.use(flash());

    // Set locals cho tất cả views
    this.app.use(auth.setLocals.bind(auth));
  }

  initRoutes() {
    // Trang chủ
    this.app.get("/", async (req, res) => {
      const ProductModel = require("./models/Product");
      const featured = await ProductModel.getActiveProducts({ limit: 8 });
      const sale = await ProductModel.getSaleProducts();
      res.render("home", {
        title: "Nội Thất Đẹp - Trang Chủ",
        featured,
        sale: sale.slice(0, 4),
      });
    });

    this.app.use("/products", productRoutes);
    this.app.use("/", userRoutes);
    this.app.use("/cart", cartRoutes);
    this.app.use("/orders", orderRoutes);
    this.app.use("/staff", staffRoutes);
    this.app.use("/admin", adminRoutes);
    // this.app.use("/chat", chatRoutes);       
    this.app.use("/reviews", reviewRoutes);  
    this.app.use("/wishlist", wishlistRoutes);
  }

  initErrorHandling() {
    // 404
    this.app.use((req, res) => {
      res.status(404).render("errors/404", { title: "Không tìm thấy trang" });
    });

    // 500
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).render("errors/500", { title: "Lỗi server" });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(` Server chạy tại: http://localhost:${this.port}`);
    });
  }
}

const app = new App();
app.start();



