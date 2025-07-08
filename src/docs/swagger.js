// /docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Room Reservation API',
      version: '1.0.0',
      description: 'API documentation for the room reservation system',
    },
    servers: [
      {
        url: 'http://localhost:3001', // veya prod URL'in
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Swagger comment'lerini buradaki dosyalarda arar
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
