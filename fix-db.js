const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/furniture_shop').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateMany(
    { avatar: '/images/default-avatar.png' },
    { $set: { avatar: '/images/default-avatar.svg' } }
  );
  console.log('Database updated successfully');
  process.exit(0);
});
