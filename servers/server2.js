const express = require("express");
const app = express();
require("dotenv").config({ path: "../.env" });
const { sentryInit } = require("../sentryConfig");
const logger = require("./logger");
const port = process.env.SERVER_2_PORT;

const Sentry = sentryInit(app);
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.get("/health-check", (req, res) => {
  res.status(200).send({ status: "OK", message: "Server is up and running" });
});

app.get("/", (req, res) => {
  logger.info(`Handling request for / at port ${port}`);
  res.json({
    status: "Server is up and running",
    port,
  });
});

app.use((err, req, res, next) => {
  logger.error("Something went wrong:", err);
  res.status(500).send("Something went wrong");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
