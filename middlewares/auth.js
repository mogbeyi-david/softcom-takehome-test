require('dotenv').config();
const status = require("http-status");
const jwt = require('jsonwebtoken');

const response = require("../utility/response");

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return response.sendError({
            res,
            statusCode: status.UNAUTHORIZED,
            message: "You need to be signed in to perform this operation"
        })
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (exception) {
        next(exception);
    }
};

module.exports = auth;
