const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connection = null;
  }

  async connect(uri) {
    try {
      this.connection = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(" Kết nối MongoDB thành công!");
      return this.connection;
    } catch (error) {
      console.error(" Lỗi kết nối MongoDB:", error.message);
      process.exit(1);
    }
  }

  disconnect() {
    mongoose.connection.close();
    console.log(" Đã ngắt kết nối MongoDB");
  }
}

module.exports = new Database(); // Singleton