const exceljs = require("exceljs");
const OrderModel = require("../models/Order");

class ReportController {
  async exportRevenue(req, res) {
    try {
      const orders = await OrderModel.getAll(
        { orderStatus: "delivered" },
        { sort: { createdAt: 1 } }
      );

      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("Doanh thu");

      // Khai báo cột
      worksheet.columns = [
        { header: "Mã Đơn Hàng", key: "id", width: 30 },
        { header: "Ngày Bán", key: "date", width: 15 },
        { header: "Tổng Tiền (VNĐ)", key: "total", width: 20 },
      ];

      // Thêm dòng
      orders.forEach(order => {
        worksheet.addRow({
          id: order._id.toString(),
          date: order.createdAt.toLocaleDateString("vi-VN"),
          total: order.total
        });
      });

      // Tổng doanh thu
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      worksheet.addRow({});
      worksheet.addRow({ date: "Tổng cộng:", total: totalRevenue });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=bao-cao-doanh-thu.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log(error);
      req.flash("error", "Lỗi xuất báo cáo Excel");
      res.redirect("/admin/dashboard");
    }
  }
}

module.exports = new ReportController();
