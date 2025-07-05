const { expressjwt: jwt } = require("express-jwt");

// Access token kontrolü
const verifyToken = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
});

// Hataları yakala
const handleAuthError = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Yetkisiz erişim." });
  }
  next(err);
};

module.exports = {
  verifyToken,
  handleAuthError,
};
