const nodemailer = require("nodemailer");

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOrderConfirmation(order, userEmail) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toLocaleString('vi-VN')}đ</td>
        <td>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
      </tr>
    `).join("");

    const mailOptions = {
      from: `"AnVietHome" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: ` Xác nhận đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif; max-width:600px; margin:auto;">
          <div style="background:#8b5e3c; color:white; padding:20px; text-align:center;">
            <h1> AnVietHome</h1>
            <h2>Xác nhận đơn hàng</h2>
          </div>
          <div style="padding:20px;">
            <p>Xin chào <strong>${order.shippingAddress.name}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được tiếp nhận.</p>
            <h3>Mã đơn hàng: #${order._id.toString().slice(-8).toUpperCase()}</h3>

            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px; border:1px solid #ddd;">Sản phẩm</th>
                  <th style="padding:8px; border:1px solid #ddd;">SL</th>
                  <th style="padding:8px; border:1px solid #ddd;">Đơn giá</th>
                  <th style="padding:8px; border:1px solid #ddd;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div style="text-align:right; margin-top:15px;">
              <p>Tạm tính: <strong>${order.subtotal.toLocaleString('vi-VN')}đ</strong></p>
              <p>Phí ship: <strong>${order.shippingFee === 0 ? 'Miễn phí' : order.shippingFee.toLocaleString('vi-VN') + 'đ'}</strong></p>
              <h3 style="color:#e74c3c;">
                Tổng: ${order.total.toLocaleString('vi-VN')}đ
              </h3>
            </div>

            <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-top:15px;">
              <h4> Địa chỉ giao hàng:</h4>
              <p>${order.shippingAddress.name} - ${order.shippingAddress.phone}</p>
              <p>${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
            </div>

            <p style="margin-top:20px;">Hotline hỗ trợ: <strong>0123 456 789</strong></p>
          </div>
          <div style="background:#333; color:white; padding:15px; text-align:center;">
            <p>© 2025 AnVietHome</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new Mailer();