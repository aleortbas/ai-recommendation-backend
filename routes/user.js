const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const clientId = process.env.ClientID;

async function userRoutes(fastify, options) {

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
    const secretKey = process.env.SECRET;
    
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);

      const values = [username, email, hash];

      await client.query(
        "INSERT INTO users (id, username, email, password, created_at) VALUES (nextval('users_id_seq'::regclass), $1, $2, $3, now())",
        values
      );

      const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

      reply
            .setCookie("foo", email, {
              path: "/", // Cookie is valid for the entire site
              httpOnly: true, // Prevent access via JavaScript
              secure: false, // Set to true if using HTTPS
              sameSite: "lax", // Options: 'strict', 'lax', or 'none'
              maxAge: 3600, // Cookie expiry in seconds
            })
            .send({ message: "token", token: token });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: "Server error" });
    } finally {
      client.release();
    }
  });

  fastify.post("/login", async (request, reply) => {
    const client = await fastify.pg.connect();
    const { email, password } = request.body;
    const secretKey = process.env.SECRET;
    try {
      const values = [email];
      const result = await client.query(
        "SELECT * FROM users WHERE username = $1",
        values
      );

      if (result.rows.length > 0) {
        const dbUser = result.rows[0].username;
        const dbPassword = result.rows[0].password;

        const match = await bcrypt.compare(password, dbPassword);

        if (email === dbUser && match) {
          const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
          reply
            .setCookie("foo", email, {
              path: "/", // Cookie is valid for the entire site
              httpOnly: true, // Prevent access via JavaScript
              secure: false, // Set to true if using HTTPS
              sameSite: "lax", // Options: 'strict', 'lax', or 'none'
              maxAge: 3600, // Cookie expiry in seconds
            })
            .send({ message: "token", token: token });
        } else {
          console.log("que putas: ");
          return reply.code(401).send({ message: "Invalid email or password" });
        }
      }
    } catch (error) {
      console.error("Error in /login:", error);
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  fastify.get("/spotify", async (request, reply) => {
    var redirect_uri = 'http://localhost:3000/'
    var state = (Math.random() + 1).toString(36).substring(7);
    var scope = 'user-read-private user-read-email';

    const authorization = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    })
    console.log("authorization: ", authorization);
    return reply.send({authorization: authorization})
  })
}
module.exports = userRoutes;
