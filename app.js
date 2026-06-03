const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
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
const reviewRoutes = require("./routes/reviewRoutes");
const newsRoutes = require("./routes/newsRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/furniture_shop";

    this.server = http.createServer(this.app);
    this.io = new Server(this.server);

    this.initDatabase();
    this.initMiddleware();
    this.initRoutes();
    this.initErrorHandling();
    this.initSocket();
  }

  initSocket() {
    const MessageModel = require("./models/Message");
    this.io.on("connection", (socket) => {
      // User join room
      socket.on("join", (roomId) => {
        socket.join(roomId);
      });

      // Staff join admin room
      socket.on("join_admin", () => {
        socket.join("admin_room");
      });

      // Receive and broadcast message
      socket.on("send_message", async (data) => {
        try {
          const { room, sender, content } = data;
          const msg = await MessageModel.create({ room, sender, content });
          const populatedMsg = await MessageModel.schema.findById(msg._id).populate("sender", "name role");
          
          this.io.to(room).emit("receive_message", populatedMsg);
          this.io.to("admin_room").emit("receive_message", populatedMsg);
        } catch (error) {
          console.error("Lỗi gửi tin nhắn:", error);
        }
      });
    });
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
    // Giới thiệu & Liên hệ
    this.app.get("/about", (req, res) => res.render("pages/about", { title: "Giới thiệu" }));
    this.app.get("/contact", (req, res) => res.render("pages/contact", { title: "Liên hệ" }));

    // Chính sách
    this.app.get("/policies/warranty", (req, res) => res.render("pages/policies/warranty", { title: "Chính sách bảo hành" }));
    this.app.get("/policies/return", (req, res) => res.render("pages/policies/return", { title: "Chính sách đổi trả" }));
    this.app.get("/policies/shipping", (req, res) => res.render("pages/policies/shipping", { title: "Chính sách vận chuyển" }));
    this.app.get("/policies/payment", (req, res) => res.render("pages/policies/payment", { title: "Thanh toán" }));
    this.app.get("/policies/check-warranty", (req, res) => res.render("pages/policies/check-warranty", { title: "Kiểm tra bảo hành" }));

    // Trang chủ
    this.app.get("/", async (req, res) => {
      try {
        const ProductModel = require("./models/Product");
        const NewsModel = require("./models/News");
        const featured = await ProductModel.getActiveProducts({ limit: 8 });
        const sale = await ProductModel.getSaleProducts();
        const newsList = await NewsModel.getAllActive(3);
        res.render("home", {
          title: "Nội Thất Đẹp - Trang Chủ",
          featured,
          sale: sale.slice(0, 4),
          newsList
        });
      } catch (err) {
        console.error("Lỗi trang chủ:", err);
        res.status(500).render("errors/500", { title: "Lỗi server" });
      }
    });

    this.app.use("/products", productRoutes);
    this.app.use("/", userRoutes);
    this.app.use("/cart", cartRoutes);
    this.app.use("/orders", orderRoutes);
    this.app.use("/staff", staffRoutes);
    this.app.use("/admin", adminRoutes);
    const chatRoutes = require("./routes/chatRoutes");
    this.app.use("/chat", chatRoutes);       
    this.app.use("/reviews", reviewRoutes);  
    this.app.use("/wishlist", wishlistRoutes);
    this.app.use("/news", newsRoutes);
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
    this.server.listen(this.port, () => {
      console.log(` Server chạy tại: http://localhost:${this.port}`);
    });
  }
}

const app = new App();
app.start();



