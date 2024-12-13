const { Client } = require("pg");
const server = require("../server")
const Redis = require("ioredis")

async function userRoutes (fastify, options) {
    let grant = "client_credentials";
    let clientId = process.env.ClientID;
    let clientSecret = process.env.ClientServer;

    const token = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            'grant_type':grant,
            'client_id':clientId,
            'client_secret':clientSecret,
        })
    })    

    const dataToken = await token.json()

    const redis = new Redis();
    const expiration = await redis.set(dataToken.access_token, dataToken.token_type, "EX", dataToken.expires_in)
    console.log("expiration: ", expiration);

    redis.get(dataToken.access_token, (err, result) => {
        if (err) {
            console.error(err)
        } else {
            console.log("GET: ", result)
        }
    })
}

module.exports = userRoutes