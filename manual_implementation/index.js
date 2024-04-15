const express = require("express");
const proxy = require("express-http-proxy");
const ConsistentHashing = require("consistent-hashing");
require("dotenv").config({ path: "../.env" });
const initializeTokenBucket = require("./tokenBucketRateLimiter");

const app = express();
const port = process.env.MAIN_SERVER_PORT;

const rateLimiter = initializeTokenBucket({
  tokensPerInterval: 10, // Allow 10 requests
  interval: 60, // per second
});

// List of server URLs
const servers = [
  `http://localhost:${process.env.SERVER_0_PORT}`,
  `http://localhost:${process.env.SERVER_1_PORT}`,
  `http://localhost:${process.env.SERVER_2_PORT}`,
];

app.use(async (req, res, next) => {
  const ip = req.ip; // Get client's IP address
  const isAllowed = await rateLimiter.getToken(ip);
  if (!isAllowed) {
    return res.status(429).send("Too Many Requests");
  }
  next();
});

// Create a consistent hashing ring
const ring = new ConsistentHashing(servers);

// Middleware to determine the target server and proxy the request
app.use((req, res, next) => {
  const clientIP = req.headers["x-forwarded-for"] || req.ip;
  const serverUrl = ring.getNode(clientIP);

  // Use express-http-proxy to forward the request to the target server
  return proxy(serverUrl)(req, res, next);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
