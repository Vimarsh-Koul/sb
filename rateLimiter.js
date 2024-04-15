const { RateLimiterRedis } = require("rate-limiter-flexible");
const redisClient = require("redis").createClient();
require("dotenv").config();

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.log("Redis client error", err));

redisClient
  .connect()
  .catch((err) => console.error("Redis connect error:", err));

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_DURATION), // Per seconds
});

module.exports = { rateLimiter };
