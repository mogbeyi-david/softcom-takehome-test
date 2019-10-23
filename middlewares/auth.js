require('dotenv').config();
const status = require("http-status");
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(status.UNAUTHORIZED).send('No token provided');
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next()
    } catch (exception) {
        res.status(status.BAD_REQUEST).send('Invalid token')
    }
};

module.exports = auth;
