const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoute');
const userRoutes = require('./src/routes/userRoute');
const reservationRoutes = require('./src/routes/reservationRoute');

const { handleAuthError  } = require('./src/middleware/authMiddleware');

const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',  // Next.js frontend adresin
  credentials: true,                 // Eğer cookie gönderiyorsan gerekebilir
}));
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/reservation', reservationRoutes);

app.use(handleAuthError);
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});