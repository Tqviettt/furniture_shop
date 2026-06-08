const nodemailer = require("nodemailer");

// Khởi tạo transporter (Trong môi trường Dev, in ra console)
const sendEmail = async (options) => {
  try {
    // Dùng Ethereal Mail giả lập để không cần cấu hình Gmail SMTP thật sự
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    const mailOptions = {
      from: '"AnVietHome" <noreply@anviethome.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("====================================");
    console.log("🚀 EMAIL ĐÃ ĐƯỢC GỬI THÀNH CÔNG TỚI:", options.email);
    console.log("💡 XEM NỘI DUNG EMAIL TẠI ĐÂY:", nodemailer.getTestMessageUrl(info));
    console.log("====================================");
  } catch (error) {
    console.error("Lỗi khi gửi email: ", error);
  }
};

module.exports = sendEmail;
