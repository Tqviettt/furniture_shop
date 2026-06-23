const PDFDocument = require("pdfkit");
const OrderModel = require("../models/Order");

class InvoiceController {
  async generateInvoice(req, res) {
    try {
      const order = await OrderModel.getOrderWithDetails(req.params.id);
      if (!order) {
        req.flash("error", "Không tìm thấy đơn hàng");
        return res.redirect("/admin/orders");
      }

      // Khởi tạo PDFDocument
      const doc = new PDFDocument({ margin: 50 });
      
      // Đăng ký font hỗ trợ Tiếng Việt (Arial)
      doc.registerFont("Arial", "C:/Windows/Fonts/arial.ttf");
      doc.registerFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf");

      // Thiết lập response header
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${order._id}.pdf`
      );

      doc.pipe(res);

      // --- Vẽ nội dung hóa đơn ---
      
      // Tiêu đề
      doc.font("Arial-Bold").fontSize(20).text("HÓA ĐƠN BÁN HÀNG", { align: "center" });
      doc.moveDown();

      // Thông tin công ty
      doc.fontSize(12).text("AnVietHome", { align: "left" });
      doc.font("Arial").text("18 Trần Bình, Mỹ Đình, Hà Nội");
      doc.text("Điện thoại: 0818273915");
      doc.moveDown();

      // Thông tin đơn hàng
      doc.text(`Mã đơn hàng: ${order._id}`);
      doc.text(`Ngày đặt: ${order.createdAt.toLocaleDateString("vi-VN")}`);
      doc.text(`Khách hàng: ${order.shippingAddress.name}`);
      doc.text(`Số điện thoại: ${order.shippingAddress.phone}`);
      doc.text(`Địa chỉ: ${order.shippingAddress.street}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`);
      doc.moveDown();

      // Bảng sản phẩm (Giả lập bằng Text do pdfkit không có table native)
      const tableTop = 280;
      doc.font("Arial-Bold");
      doc.text("Tên Sản Phẩm", 50, tableTop);
      doc.text("Đơn Giá", 280, tableTop);
      doc.text("SL", 380, tableTop);
      doc.text("Thành Tiền", 440, tableTop);
      
      doc.font("Arial");
      let position = tableTop + 20;

      order.items.forEach(item => {
        doc.text(item.name.substring(0, 30), 50, position);
        doc.text(item.price.toLocaleString("vi-VN") + "đ", 280, position);
        doc.text(item.quantity.toString(), 380, position);
        doc.text((item.price * item.quantity).toLocaleString("vi-VN") + "đ", 440, position);
        position += 20;
      });

      doc.moveDown();
      position += 20;

      // Tổng kết
      doc.font("Arial-Bold");
      doc.text("Tạm tính:", 300, position);
      doc.text(order.subtotal.toLocaleString("vi-VN") + "đ", 440, position);
      position += 20;

      doc.text("Phí giao hàng:", 300, position);
      doc.text(order.shippingFee.toLocaleString("vi-VN") + "đ", 440, position);
      position += 20;

      doc.text("Giảm giá:", 300, position);
      doc.text("-" + order.discount.toLocaleString("vi-VN") + "đ", 440, position);
      position += 20;

      doc.text("TỔNG CỘNG:", 300, position);
      doc.text(order.total.toLocaleString("vi-VN") + "đ", 440, position);

      // Kết thúc file
      doc.end();

    } catch (error) {
      console.log(error);
      req.flash("error", "Lỗi tạo hóa đơn PDF");
      res.redirect("/admin/orders");
    }
  }
}

module.exports = new InvoiceController();
