async function userRoutes(fastify, options) {
    fastify.get('/users', async (request, reply) => {
        try {
          const client = await fastify.pg.connect(); // Access the database client
          const { rows } = await client.query('SELECT * FROM users');
          client.release(); // Release the client after use
          reply.send(rows);
        } catch (err) {
          reply.status(500).send({ error: 'Database query failed' });
        }
      });
}
module.exports = userRoutes;