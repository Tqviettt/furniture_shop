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

      // Thiết lập response header
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${order._id}.pdf`
      );

      doc.pipe(res);

      // --- Vẽ nội dung hóa đơn ---
      
      // Tiêu đề
      doc.fontSize(20).text("HOA DON BAN HANG", { align: "center" });
      doc.moveDown();

      // Thông tin công ty
      doc.fontSize(12).text("AnVietHome", { align: "left" });
      doc.text("18 Tran Binh, My Dinh, Ha Noi");
      doc.text("Dien thoai: 0818273915");
      doc.moveDown();

      // Thông tin đơn hàng
      doc.text(`Ma don hang: ${order._id}`);
      doc.text(`Ngay dat: ${order.createdAt.toLocaleDateString("vi-VN")}`);
      doc.text(`Khach hang: ${order.shippingAddress.name}`);
      doc.text(`So dien thoai: ${order.shippingAddress.phone}`);
      doc.text(`Dia chi: ${order.shippingAddress.street}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`);
      doc.moveDown();

      // Bảng sản phẩm (Giả lập bằng Text do pdfkit không có table native)
      const tableTop = 280;
      doc.font("Helvetica-Bold");
      doc.text("Ten San Pham", 50, tableTop);
      doc.text("Don Gia", 280, tableTop);
      doc.text("SL", 380, tableTop);
      doc.text("Thanh Tien", 440, tableTop);
      
      doc.font("Helvetica");
      let position = tableTop + 20;

      order.items.forEach(item => {
        doc.text(item.name.substring(0, 30), 50, position);
        doc.text(item.price.toLocaleString("vi-VN") + "d", 280, position);
        doc.text(item.quantity.toString(), 380, position);
        doc.text((item.price * item.quantity).toLocaleString("vi-VN") + "d", 440, position);
        position += 20;
      });

      doc.moveDown();
      position += 20;

      // Tổng kết
      doc.font("Helvetica-Bold");
      doc.text("Tam tinh:", 300, position);
      doc.text(order.subtotal.toLocaleString("vi-VN") + "d", 440, position);
      position += 20;

      doc.text("Phi giao hang:", 300, position);
      doc.text(order.shippingFee.toLocaleString("vi-VN") + "d", 440, position);
      position += 20;

      doc.text("Giam gia:", 300, position);
      doc.text("-" + order.discount.toLocaleString("vi-VN") + "d", 440, position);
      position += 20;

      doc.text("TONG CONG:", 300, position);
      doc.text(order.total.toLocaleString("vi-VN") + "d", 440, position);

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
