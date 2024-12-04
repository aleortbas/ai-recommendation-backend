const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const fastifyCookie = require('@fastify/cookie');
require("dotenv").config()


// Register plugins and routes
fastify.register(require('./dbConnection'));
fastify.register(require('./routes/user'));
fastify.register(require('./routes/api'));
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

//Register plugins for cookies
fastify.register(fastifyCookie, {
  secret: process.env.SECRETCOOKIES,
  hook: 'onRequest',
  parseOptions: {}
})

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  // Log the error
  fastify.log.error(error);

  // Send error response
  reply.status(error.statusCode || 500).send({
    error: true,
    message: error.message || 'Internal Server Error',
  });
});

// Start the server
fastify.listen({ port: 5000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info('Server is running on http://localhost:5000');
});

// Handle Uncaught Exceptions and Rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
