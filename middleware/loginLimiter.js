const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per window per minute
  message: {
    message: 'Too many requests from this IP, please try again in 1 minute'
  },
  handler: (req, res, next, options) => {
    logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    res.status(options.statusCode).send(options.message)
  },
  standardHeaders: true, // Return rate limit in standard headers ('RateLimit-*)
  legacyHeaders: false // Disable the 'X-RateLimit' header
})

module.exports = loginLimiter