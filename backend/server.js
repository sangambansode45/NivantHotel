// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();

// const authRoutes = require('./routes/authRoutes');
// const itemRoutes = require('./routes/itemRoutes');
// const orderRoutes = require('./routes/orderRoutes');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/items', itemRoutes);
// app.use('/api/orders', orderRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // ✅ Load .env

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder (optional - not needed for Cloudinary but ok to keep)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

// ✅ Test route (optional but useful)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// ✅ Error handling middleware (IMPORTANT)
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

const PORT = 5001;

// ✅ Start server
console.log("ENV PORT:", process.env.PORT);
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});