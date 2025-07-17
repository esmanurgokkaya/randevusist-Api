const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

/**
 * logs klasörü yoksa oluşturulur
 */
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * Winston logger konfigürasyonu
 * - level: loglama seviyesi (info ve üzeri)
 * - format: zaman damgası ve log mesajı formatı
 * - transports: konsol ve dosya loglama (error.log ve combined.log)
 */
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
  ]
});

module.exports = logger;
