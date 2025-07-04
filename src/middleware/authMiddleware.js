// 
const { expressjwt } = require("express-jwt")

const secret = process.env.JWT_SECRET;

const token = expressjwt({
    secret : secret,
     algorithms: ['HS256'],

});

const handleAuthError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // Eğer hata UnauthorizedError ise (token yok veya geçersiz)
        return res.status(401).json({ message: 'Erişim reddedildi. Geçersiz veya süresi dolmuş token.', error: err.message });
    }
    next(err);
};

module.exports = {
    token,
    handleAuthError
};