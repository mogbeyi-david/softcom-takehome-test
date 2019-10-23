const mongoose = require('mongoose');
const status = require("http-status");

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(status.NOT_FOUND).send({message: 'Invalid ObjectId Passed'})
    }
    next();
};

module.exports = validateObjectId;
