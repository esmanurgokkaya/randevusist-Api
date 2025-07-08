require('dotenv').config(); // .env yükle
const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

const { handleAuthError } = require('./src/middleware/authMiddleware');
const authRoutes = require('./src/routes/auth.route');
const roomRoutes = require('./src/routes/room.route');
const reservationRoutes = require('./src/routes/reservation.route');
const userRoutes = require('./src/routes/user.route');
const app = express();

// ----------------------
// 🔧 Orta Katmanlar (Middlewares)
// ----------------------
app.use(cors());                        // CORS izinleri
// app.use(helmet());                      // Güvenlik başlıkları
// app.use(morgan('dev'));                 // İstek logları
app.use(express.json());               // JSON parse
app.use(express.urlencoded({ extended: true })); // Form verisi

// ----------------------
// 📌 API Rotaları
// ----------------------
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/', reservationRoutes); // rezervasyon rotası içinde /reservations zaten var

// ----------------------
// ⚠️ Auth Error Yakalama
// ----------------------
app.use(handleAuthError);

// ----------------------
// 🚀 Sunucuyu Başlat
// ----------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
