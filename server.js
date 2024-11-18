const fastify = require('fastify')();
const cors = require('@fastify/cors')

fastify.register(require('./dbConnection'));

fastify.register(require('./routes/user')); 

fastify.register(cors, {
    origin: '*',
   methods: ['GET', 'POST', 'PUT', 'DELETE']
});

fastify.listen({port: 5000}, (err) => {
    if(err){
        fastify.log.error(err)
        process.exit(1)
    }
})