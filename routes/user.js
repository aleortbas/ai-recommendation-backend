const bcrypt = require('bcrypt');
const saltRounds = 10;

async function userRoutes(fastify, options) {

  fastify.register(require('@fastify/jwt'), {
    secret: 'supersecret'
  })
  

    fastify.get('/users', async (request, reply) => {
        try {
          const client = await fastify.pg.connect(); 
          const { rows } = await client.query('SELECT * FROM users');
          client.release(); 
          reply.send(rows);
        } catch (err) {
          reply.status(500).send({ error: 'Database query failed' });
        }
      });

      fastify.post("/signUp", async (request, reply) => {
        const client = await fastify.pg.connect(); 
        const { username,email,password } = request.body;
        bcrypt.hash(password, saltRounds,async function (err, hash) {
          const values = [username,email,hash]
          try {
            const {rows} = await client.query("INSERT INTO users VALUES(nextval('users_id_seq'::regclass), $1, $2, $3, now())", values)
            reply.send(rows,{ message: 'Login logic not implemented yet'});
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
          }
        })
      })
}
module.exports = userRoutes;