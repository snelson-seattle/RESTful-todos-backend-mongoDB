const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login requests per minute
  message: {
    message:
      "Too many login attempts from this IP, please try again after waiting for at least 60 seconds.",
    handler: (req, res, next, options) => {
      console.log(
        `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`
      );
      res.status(options.statusCode).send(options.message);
    },
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = loginLimiter;
