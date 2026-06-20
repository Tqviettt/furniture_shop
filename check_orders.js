const mongoose = require('mongoose');
const OrderModel = require('./models/Order');

mongoose.connect('mongodb://localhost:27017/furniture_shop').then(async () => {
    const orders = await OrderModel.schema.find({ total: { $lt: 0 } });
    console.log(JSON.stringify(orders, null, 2));
    process.exit(0);
});
