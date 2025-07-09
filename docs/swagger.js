// docs/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Rezervasyon Sistemi API",
    version: "1.0.0",
    description: "Bu API kullanıcı ve rezervasyon işlemlerini içerir.",
  },
  servers: [
    {
      url: "http://localhost:3001", // değiştirilebilir
      description: "Geliştirme sunucusu",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/controller/*.js"], // Yorumlarla API açıklamaları buradan okunur
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

