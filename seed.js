const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost:27017/furniture_shop');
const User = require('./models/User').schema;

async function seed() {
  await User.deleteMany({ email: { $in: ['admin@gmail.com','staff@gmail.com','customer@gmail.com'] }});

  const pass = await bcrypt.hash('123456', 12);

  await User.insertMany([
    { name: 'Admin', email: 'admin@gmail.com', password: pass, role: 'admin' },
    { name: 'Nhân Viên', email: 'staff@gmail.com', password: pass, role: 'staff' },
    { name: 'Khách Hàng', email: 'customer@gmail.com', password: pass, role: 'customer' },
  ]);

  console.log(' Tạo tài khoản thành công!');
  console.log(' Admin:    admin@gmail.com / 123456');
  console.log(' Nhân viên: staff@gmail.com / 123456');
  console.log(' Khách hàng: customer@gmail.com / 123456');
  process.exit();
}
seed();
const Coupon = require('./models/Coupon').schema;

await Coupon.deleteMany({});
await Coupon.insertMany([
  {
    code: "WELCOME10",
    discountType: "percent",
    discountValue: 10,
    minOrder: 500000,
    maxUses: 100,
  },
  {
    code: "GIAM50K",
    discountType: "fixed",
    discountValue: 50000,
    minOrder: 1000000,
    maxUses: 50,
  },
]);
console.log(" Tạo coupon thành công!");