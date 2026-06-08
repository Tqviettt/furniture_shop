const mongoose = require("mongoose");
const CategoryModel = require("./models/Category");

mongoose.connect("mongodb://127.0.0.1:27017/furniture_shop").then(async () => {
  console.log("Connected to MongoDB for Category Seed");
  const defaultCategories = [
    { name: "Sofa", slug: "sofa", description: "Bàn ghế sofa cao cấp" },
    { name: "Bàn", slug: "ban", description: "Các loại bàn làm việc, bàn ăn" },
    { name: "Ghế", slug: "ghe", description: "Các loại ghế đa năng" },
    { name: "Giường", slug: "giuong", description: "Giường ngủ êm ái" },
    { name: "Tủ", slug: "tu", description: "Tủ quần áo, tủ giày" },
    { name: "Kệ", slug: "ke", description: "Kệ sách, kệ tivi" },
    { name: "Khác", slug: "khac", description: "Các sản phẩm nội thất khác" },
  ];

  for (const cat of defaultCategories) {
    const exists = await CategoryModel.schema.findOne({ slug: cat.slug });
    if (!exists) {
      await CategoryModel.create(cat);
      console.log(`Seeded category: ${cat.name}`);
    }
  }
  console.log("Category seeding complete!");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
