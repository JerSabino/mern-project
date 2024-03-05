const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' })
  }

  const foundUser = await User.findOne({ username }).exec()

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: 'Invalid Credentials' })
  }
  
  const match = await bcrypt.compare(password, foundUser.password)

  if (!match){
    return res.status(401).json({ message: 'Password is incorrect'})
  }

  // Create access/refresh tokens and secure cookie
  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "username": foundUser.username,
        "roles": foundUser.roles
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1m' }
  )

  const refreshToken = jwt.sign(
    {
      "username": foundUser.username 
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d'}
  )

  res.cookie('jwt', refreshToken, {
    httpOnly: true, // Accessible only by web server
    secure: true, // HTTPs only
    sameSite: 'None', // Cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000 // Expiry
  })

  // Send access token containing username and roles
  res.json({ accessToken })
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwt){
    return res.status(401).json({ message: 'Unauthorized'})
  }

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ messsage: 'Forbidden' })

      const foundUser = await User.findOne({ username: decoded.username }).exec()

      if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })
      
      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "username": foundUser.username,
            "roles": foundUser.roles
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
      )

      res.json({ accessToken})
    })
  )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - clear cookie if it exists
const logout = (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwt) return res.status(204) // No content

  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true
  })
  res.json({ message: 'Cookie cleared' })
}

module.exports = {
  login,
  refresh,
  logout
}