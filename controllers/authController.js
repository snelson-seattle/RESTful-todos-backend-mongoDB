const { User } = require("../models");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  console.log(`The user ${username} is attempting to login.`);
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const existingUser = await User.findOne({ username }).exec();

  if (!existingUser) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const match = await existingUser.isCorrectPassword(password);

  if (!match) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      username: existingUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden." });
      }

      const existingUser = await User.findOne({ username: decoded.username });

      if (!existingUser) {
        return res.status(401).json({ message: "Unauthorized." });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
};

const logout = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookie was deleted." });
};

module.exports = { login, refresh, logout };
