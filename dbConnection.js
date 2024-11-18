const fastifyPlugin = require('fastify-plugin');
const fastifyPostgres = require('@fastify/postgres');

async function dbConnector(fastify, options) {
    fastify.register(fastifyPostgres, {
        connectionString: 'postgres://postgres:12345678@localhost:5432/ai-recommendation'
    })
}
module.exports = fastifyPlugin(dbConnector);