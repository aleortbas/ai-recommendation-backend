const fastify = require('fastify')();


fastify.register(require('./dbConnection'));

fastify.register(require('./routes/user')); 
fastify.listen({port: 5000}, (err) => {
    if(err){
        fastify.log.error(err)
        process.exit(1)
    }
})