const status = require("http-status");
const response = require("../utility/response");

const admin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return response.sendError({res, message: "Access Denied", statusCode: status.FORBIDDEN});
    }
    next();
};

module.exports = admin;
