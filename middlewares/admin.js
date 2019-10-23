const status = require("http-status");

function admin(req, res, next) {
    if (!req.user.isAdmin) {
        return res.status(status.FORBIDDEN).send({message: 'Access Denied'})
    }
    next();
}

module.exports = admin;
