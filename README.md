# Nội Thất Đẹp - E-commerce Furniture Shop

Một ứng dụng web thương mại điện tử chuyên cung cấp các sản phẩm nội thất, được xây dựng bài bản với **Node.js**, **Express**, **MongoDB** và **EJS**.

## 🚀 Các tính năng chính (Features)
- 🛒 **Mua sắm & Giỏ hàng**: Duyệt danh sách sản phẩm, thêm vào giỏ hàng và tiến hành đặt hàng.
- 🔐 **Tài khoản & Phân quyền**: Chức năng đăng nhập, đăng ký với phân quyền rõ ràng (Người dùng, Nhân viên, Quản trị viên).
- ❤️ **Wishlist (Sản phẩm yêu thích)**: Lưu lại các sản phẩm mà khách hàng quan tâm.
- ⭐ **Đánh giá & Nhận xét**: Cho phép khách hàng đánh giá sản phẩm.
- 📦 **Quản lý Đơn hàng**: Theo dõi trạng thái của các đơn hàng.
- 🎟️ **Mã giảm giá (Coupon)**: Áp dụng mã giảm giá khi thanh toán giỏ hàng.
- 💬 **Trò chuyện trực tuyến (Chat)**: Tính năng nhắn tin hỗ trợ khách hàng.

## 🛠 Công nghệ sử dụng (Tech Stack)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (thông qua thư viện Mongoose ODM)
- **Template Engine:** EJS, Express-EJS-Layouts
- **Tiện ích khác:** 
  - `express-session` & `connect-flash`: Quản lý phiên đăng nhập và thông báo.
  - `bcryptjs`: Mã hóa mật khẩu an toàn.
  - `multer`: Quản lý và tải lên file (hình ảnh).
  - `nodemailer`: Hỗ trợ gửi Email thông báo.

## ⚙️ Cài đặt và Chạy dự án (Installation)

1. **Cài đặt thư viện (Dependencies):**
   Mở terminal tại thư mục gốc của dự án và chạy:
   ```bash
   npm install
   ```

2. **Cấu hình môi trường (`.env`):**
   Kiểm tra và đảm bảo file `.env` ở thư mục gốc có các thông số cơ bản sau:
   ```env
   MONGO_URI=mongodb://localhost:27017/furniture_shop
   SESSION_SECRET=furniture_secret_123
   PORT=3000
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Khởi động Server:**
   - Dùng lệnh này khi đang phát triển (tự động tải lại server khi code thay đổi):
     ```bash
     npm run dev
     ```
   - Dùng lệnh này khi chạy môi trường thực tế (production):
     ```bash
     npm start
     ```

4. **Trải nghiệm ứng dụng:**
   Mở trình duyệt và truy cập vào địa chỉ: [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc thư mục (Folder Structure)
- `config/` - Cấu hình hệ thống (Kết nối Database, cấu hình Mail,...).
- `controllers/` - Xử lý logic hoạt động cho các chức năng tương ứng.
- `middleware/` - Các tệp trung gian kiểm tra xác thực, quyền truy cập.
- `models/` - Định nghĩa Schema cấu trúc dữ liệu cho MongoDB.
- `public/` - Chứa file tĩnh như hình ảnh, CSS, JavaScript cho frontend.
- `routes/` - Quản lý và điều hướng các API/URL của ứng dụng.
- `views/` - Giao diện hiển thị cho người dùng, sử dụng EJS.
