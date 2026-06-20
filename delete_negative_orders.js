const mongoose = require('mongoose');
const OrderModel = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/furniture_shop').then(async () => {
    const res = await OrderModel.schema.deleteMany({ total: { $lt: 0 } });
    console.log("Deleted", res.deletedCount, "orders");
    process.exit(0);
});
