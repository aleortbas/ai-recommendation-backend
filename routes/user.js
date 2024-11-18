const bcrypt = require("bcrypt");
const saltRounds = 10;

async function userRoutes(fastify, options) {
  fastify.register(require("@fastify/jwt"), {
    secret: "supersecret",
  });

  fastify.get("/users", async (request, reply) => {
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query("SELECT * FROM users");
      client.release();
      reply.send(rows);
    } catch (err) {
      reply.status(500).send({ error: "Database query failed" });
    }
  });

  fastify.post("/signUp", async (request, reply) => {
    const client = await fastify.pg.connect();
    const { username, email, password } = request.body;

    try {
      const hash = await bcrypt.hash(password, 10);

      const values = [username, email, hash];

      await client.query(
        "INSERT INTO users (id, username, email, password, created_at) VALUES (nextval('users_id_seq'::regclass), $1, $2, $3, now())",
        values
      );

      reply.send({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: "Server error" });
    } finally {
      client.release();
    }
  });
}
module.exports = userRoutes;
