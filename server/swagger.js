const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cinemap GIS API',
      version: '1.0.0',
      description: 'Web GIS Projesi için Film Lokasyon API Dokümantasyonu',
      contact: {
        name: 'Geliştirici',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Yerel Geliştirme Sunucusu',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Rota dosyalarının nerede olduğunu belirtiyoruz
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };