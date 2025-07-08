// Winston: loglama işlemleri için kullanılan popüler bir Node.js kütüphanesi
const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf, errors, colorize } = format;

// 🧱 Log mesajlarının nasıl biçimleneceğini tanımlayan özel format
// Hata varsa stack trace'i, yoksa mesajı gösterir
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// 📝 Logger nesnesi oluşturuluyor
const logger = createLogger({
  level: 'info', // Loglama seviyesi: en düşük seviye. (error < warn < info < http < debug)
  
  // 🎛 Formatlama ayarları
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Her loga zaman damgası ekle
    errors({ stack: true }), // Hatalarda stack trace (hata izleri) dahil et
    logFormat // Yukarıda tanımlanan printf biçimi kullan
  ),

  // 📤 Logların hangi ortamlara gönderileceği
  transports: [
    // 1️⃣ Konsola renkli çıktı (geliştirme ortamı için ideal)
    new transports.Console({
      format: combine(
        colorize(), // Renkli seviyeler: info = mavi, error = kırmızı vs.
        logFormat   // Özel formatımızla birlikte kullan
      ),
    }),

    // 2️⃣ Sadece error seviyesindeki logları `logs/error.log` dosyasına yaz
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),

    // 3️⃣ Tüm seviyeleri `logs/combined.log` dosyasına yaz
    new transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// 🌐 Başka dosyalarda kullanmak için dışa aktar
module.exports = logger;
