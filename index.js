// 🌐 Temel bağımlılıkları dahil et
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // .env dosyasındaki değişkenleri yükle

// 📦 Route dosyalarını içeri al
const roomRoutes = require("./src/routes/roomRoute");
const authRoutes = require('./src/routes/authRoute');
const userRoutes = require('./src/routes/userRoute');
const reservationRoutes = require('./src/routes/reservationRoute');

// 🛡️ Middleware - Hataları yakalamak için özel auth middleware
const { handleAuthError } = require('./src/middleware/authMiddleware');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");


// 🚀 Uygulama başlat
const app = express();
const PORT = process.env.PORT || 5000; // PORT yoksa 5000 fallback olarak kullanılır

// 🔧 Middleware - JSON istek gövdesini ayrıştır
app.use(express.json());

// 🔓 CORS ayarları - Next.js frontend erişimine izin ver
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend adresin
  credentials: true               // Eğer cookie-based auth varsa true olmalı
}));


// 📁 Route tanımları
app.use('/auth', authRoutes);           
app.use('/users', userRoutes);          
app.use('/reservations', reservationRoutes); 
app.use("/rooms", roomRoutes);

// ⚠️ Hataları merkezi olarak yakalayan middleware (örn: JWT geçersizse)
app.use(handleAuthError);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});
