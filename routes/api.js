const server = require("../server")
const Redis = require("ioredis")

async function userRoutes (fastify, options) {
    let grant = "client_credentials";
    let clientId = process.env.ClientID;
    let clientSecret = process.env.ClientServer;

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            'grant_type':grant,
            'client_id':clientId,
            'client_secret':clientSecret
        })
    })

    const data = await response.json()

    const redis = new Redis();
    const expiration = await redis.set(data.access_token, data.token_type, "EX", data.expires_in)
    console.log("expiration: ", expiration);
    
}

module.exports = userRoutes