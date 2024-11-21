const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");


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
      const salt = await bcrypt.genSalt(saltRounds)
      const hash = await bcrypt.hash(password, salt);

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

  fastify.post("/login", async (request, reply) => {
    const client = await fastify.pg.connect();
    const { username, password } = request.body
    const secretKey = "secret";
    try {
      const values = [username]
      const result = await client.query(
        "SELECT * FROM users WHERE username = $1", values,
      )

      if (result.rows.length > 0) {
        const dbUser = result.rows[0].username
        const dbPassword = result.rows[0].password

        const match = await bcrypt.compare(password, dbPassword)

        if (username === dbUser && match) {
          const token = jwt.sign({username}, secretKey, { expiresIn: "1h" })
          console.log("token; ", token);
          reply.send({message: "token", token:token})
        }else {
          console.log("not equal");
        }
      }
      
    } catch (error) {
      
    }
  })
}
module.exports = userRoutes;
