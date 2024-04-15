const express = require("express");
const router = express.Router();

// Define the '/api/stats' endpoint
router.get("/stats", (req, res) => {
  if (!req.rateLimit) {
    return res
      .status(503)
      .json({ error: "Rate limiting information is unavailable." });
  }

  const rateLimitStatus = {
    totalRequestsMade: rateLimitRes.consumedPoints,
    remainingRequests: req.rateLimit.remainingPoints,
    resetTime: req.rateLimit.msBeforeNext / 1000,
  };

  res.json({
    status: "Server is up and running",
    serverTime: new Date(),
    rateLimitStatus,
  });
});

module.exports = router;
