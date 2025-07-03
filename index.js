const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
