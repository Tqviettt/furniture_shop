const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Kết nối database
mongoose.connect("mongodb://localhost:27017/furniture_shop")
  .then(() => console.log("Đã kết nối MongoDB"))
  .catch(err => console.error("Lỗi kết nối", err));

const ProductModel = require("./models/Product");
const Product = ProductModel.schema;

const sofaNames = ["Sofa Góc Chữ L Kuka", "Sofa Băng Da Bò Ý", "Sofa Vải Nỉ Bắc Âu", "Sofa Giường Thông Minh", "Sofa Tân Cổ Điển Châu Âu", "Sofa Thư Giãn Chỉnh Điện", "Sofa Đơn Đọc Sách", "Sofa Băng Nhỏ Gọn", "Sofa Văng 3 Chỗ Chân Gỗ", "Sofa Chữ U Sang Trọng"];
const banNames = ["Bàn Trà Kính Cường Lực", "Bàn Ăn Mặt Đá Cẩm Thạch", "Bàn Gỗ Sồi Nguyên Khối", "Bàn Tròn Cafe Tulip", "Bàn Làm Việc Chữ L Hiện Đại", "Bàn Trang Điểm Kèm Gương LED", "Bàn Đảo Bếp Đa Năng", "Bàn Trà Gỗ Óc Chó Chân Sắt", "Bàn Ăn Có Thể Mở Rộng", "Bàn Học Kèm Giá Sách"];
const gheNames = ["Ghế Ăn Bọc Da Cao Cấp", "Ghế Xoay Văn Phòng Công Thái Học", "Ghế Eames Chân Gỗ", "Ghế Thư Giãn Bập Bênh", "Ghế Đẩu Gỗ Tự Nhiên", "Ghế Bar Chân Sắt Cao", "Ghế Lười Hạt Xốp Đọc Sách", "Ghế Accent Kèm Đôn Thư Giãn", "Ghế Giám Đốc Bọc Da", "Ghế Gấp Gọn Tiện Lợi"];
const giuongNames = ["Giường Ngủ Gỗ Công Nghiệp MDF", "Giường Bọc Da Khung Gỗ Sồi", "Giường Tầng Trẻ Em Gỗ Thông", "Giường Thông Minh Có Ngăn Kéo Dưới", "Giường Bọc Vải Nỉ Mềm Mại", "Giường Gỗ Đỏ Tự Nhiên", "Giường Tròn Độc Đáo Hiện Đại", "Giường Bọc Nỉ Đầu Giường Cao", "Giường Phản Kiểu Nhật Bản", "Giường Cổ Điển Chạm Khắc Tinh Xảo"];
const tuNames = ["Tủ Quần Áo Cửa Lùa Kính", "Tủ Kệ Tivi Gỗ Treo Tường", "Tủ Giày Thông Minh Xoay", "Tủ Rượu Cánh Kính Gương", "Tủ Bếp Acrylic Bóng Gương", "Tủ Quần Áo 4 Cánh Kịch Trần", "Tủ Sách Gỗ Chia Ngăn", "Tủ Đầu Giường (Tab) Mini", "Tủ Hồ Sơ Gỗ Công Nghiệp", "Tủ Trang Trí Vách Ngăn Phòng"];

const generateProducts = (names, category, basePrice, imgKeyword) => {
    return names.map((name, index) => {
        const price = basePrice + (index * 500000);
        const salePrice = index % 3 === 0 ? price * 0.85 : 0; // Giảm giá cho một số sản phẩm
        
        return {
            name: name,
            description: `${name} mang thiết kế Minimalist gọn gàng, tinh tế. Sử dụng chất liệu cao cấp, độ bền cao. Phù hợp cho nhiều không gian sống hiện đại. Kích thước chuẩn, màu sắc nhã nhặn dễ phối hợp nội thất.`,
            price: price,
            salePrice: salePrice,
            category: category,
            images: [
                `/images/${imgKeyword}.png`,
                `/images/${imgKeyword}.png`,
                `/images/${imgKeyword}.png`
            ],
            stock: 10 + index * 2,
            material: category === 'sofa' ? 'Da/Vải Nỉ' : (category === 'ban' || category === 'tu' || category === 'giuong') ? 'Gỗ Sồi/MDF' : 'Gỗ/Kim loại',
            dimensions: {
                width: 100 + index * 10,
                height: 80 + index * 5,
                depth: 50 + index * 2
            },
            isActive: true,
            approvalStatus: 'approved',
            rating: 4 + (index % 2 === 0 ? 0.5 : 1), // 4.5 or 5
            reviewCount: 10 + index * 5
        };
    });
};

const allProducts = [
    ...generateProducts(sofaNames.slice(0, 5), "sofa", 5000000, "sofa"),
    ...generateProducts(banNames.slice(0, 5), "ban", 2000000, "table"),
    ...generateProducts(gheNames.slice(0, 5), "ghe", 800000, "chair"),
    ...generateProducts(giuongNames.slice(0, 5), "giuong", 6000000, "bed"),
    ...generateProducts(tuNames.slice(0, 5), "tu", 3000000, "cabinet")
];

async function seedData() {
    try {
        await Product.deleteMany({}); // Xóa dữ liệu cũ
        console.log(" Đã xóa dữ liệu sản phẩm cũ.");
        
        await Product.insertMany(allProducts);
        console.log(` Đã thêm thành công ${allProducts.length} sản phẩm mới!`);
        
        process.exit();
    } catch (err) {
        console.error(" Lỗi khi seed dữ liệu:", err);
        process.exit(1);
    }
}

seedData();
