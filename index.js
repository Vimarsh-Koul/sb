const express = require("express");
const proxy = require("express-http-proxy");
const ConsistentHashing = require("consistent-hashing");
const { rateLimiter } = require("./rateLimiter");
const { sentryInit } = require("./sentryConfig");
const statsRouter = require("./rateLimiterStats");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.MAIN_SERVER_PORT;
const Sentry = sentryInit(app);

app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// List of server URLs
const servers = [
  `http://localhost:${process.env.SERVER_0_PORT}`,
  `http://localhost:${process.env.SERVER_1_PORT}`,
  `http://localhost:${process.env.SERVER_2_PORT}`,
];

const rateLimitMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then((rateLimitData) => {
      req.rateLimit = {
        remainingPoints: rateLimitData.remainingPoints,
        msBeforeNext: rateLimitData.msBeforeNext,
      };
      next();
    })
    .catch((rateLimitData) => {
      Sentry.captureException(`Too Many Requests for IP ${req.ip}`);
      res.status(429).json({
        message: "Too Many Requests",
        retryAfter: Math.round(rateLimitData.msBeforeNext / 1000),
      });
    });
};

app.use(rateLimitMiddleware);
app.use("/api", statsRouter);

// Create a consistent hashing ring
const ring = new ConsistentHashing(servers);

app.use(async (req, res, next) => {
  const clientIP = req.headers["x-forwarded-for"] || req.ip;

  async function isServerUp(url) {
    try {
      await axios.get(url + "/health-check");
      return true;
    } catch (error) {
      return false;
    }
  }

  const originalServerUrl = ring.getNode(clientIP);
  let serverUrl = originalServerUrl;
  let allServersChecked = false;

  do {
    if (await isServerUp(serverUrl)) {
      return proxy(serverUrl)(req, res, next);
    } else {
      // Get the next server in the ring
      let nextServerIndex = (servers.indexOf(serverUrl) + 1) % servers.length;
      serverUrl = servers[nextServerIndex];

      // Check if we've looped through all servers
      if (serverUrl === originalServerUrl) {
        allServersChecked = true;
      }
    }
  } while (!allServersChecked);

  // If no servers are available, send a response
  res.status(503).send("None of the servers are available.");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
