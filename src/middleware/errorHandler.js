const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err); // logla

  res.status(500).json({
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;
