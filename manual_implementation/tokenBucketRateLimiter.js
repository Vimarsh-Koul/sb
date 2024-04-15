const redis = require("redis");
const client = redis.createClient();

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// Connect the client
client.connect().catch(console.error);

const initializeTokenBucket = ({ tokensPerInterval, interval }) => {
  const getToken = async (ip) => {
    const key = `userIP:${ip}`;
    const now = Date.now();

    let data = await client.get(key);
    let oldTokens = tokensPerInterval; // Assume full tokens if no data
    let lastRefill = now; // Assume the last refill time is now if no data

    if (data) {
      data = JSON.parse(data);
      oldTokens = data.tokens;
      const timePassed = (now - data.timeStamp) / 1000;
      const tokensToAdd = Math.floor(
        timePassed * (tokensPerInterval / interval)
      );

      if (tokensToAdd > 0) {
        oldTokens = Math.min(tokensPerInterval, oldTokens + tokensToAdd);
        lastRefill = now; // Update last refill time to now only when tokens are added
      } else {
        lastRefill = data.timeStamp; // Keep the last known refill time if no tokens are added
      }
    }

    const isAllowed = oldTokens > 0;
    let newTokens = oldTokens - (isAllowed ? 1 : 0);

    console.log(newTokens);

    // Always update the token count and timestamp to ensure correct tracking
    await client.set(
      key,
      JSON.stringify({
        tokens: newTokens,
        timeStamp: lastRefill,
      })
    );

    return isAllowed;
  };

  return { getToken };
};

module.exports = initializeTokenBucket;
