const fastifyPlugin = require('fastify-plugin');
const fastifyPostgres = require('@fastify/postgres');
const Redis = require("ioredis")


async function dbConnector(fastify, options) {
    fastify.register(fastifyPostgres, {
        connectionString: 'postgres://postgres:12345678@localhost:5432/ai-recommendation'
    })

    const redis = new Redis({
        port: 15841,
        host:'redis-15841.c17.us-east-1-4.ec2.redns.redis-cloud.com',
        username: 'default',
        password: 'SooI1qlHn9kbptLCxi6qNDHIYYjz0Aoi',        
    })
    redis.on('error', err => console.log('Redis Client Error', err));
 
}
module.exports = fastifyPlugin(dbConnector);