const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
require("dotenv").config();

const sentryInit = (app) => {
  Sentry.init({
    dsn: `https://${process.env.SENTRY_PREFIX_KEY}.ingest.us.sentry.io/${process.env.SENTRY_SUFFIX_KEY}`,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  return Sentry;
};

module.exports = { sentryInit };
