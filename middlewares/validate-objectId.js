const mongoose = require('mongoose');
const status = require("http-status");
const response = require("../utility/response");

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return response.sendError({res, statusCode: status.NOT_FOUND, message: "Invalid ObjectId Passed"});
    }
    next();
};

module.exports = validateObjectId;
