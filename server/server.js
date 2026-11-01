require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) { console.error('MONGO_URI is missing'); process.exit(1); }

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
