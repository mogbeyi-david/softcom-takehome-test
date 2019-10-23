const status = require("http-status");
const _ = require("lodash");

const UserRepository = require("../../../repositories/UserRepository");

const validateCreateUser = require("../../../validations/user/validate-create-user");
const response = require("../../../utility/response");
const hasher = require("../../../utility/hasher");

class UserController {

    async create(req, res, next) {

        const {error} = validateCreateUser(req.body);
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }

        try {
        } catch (e) {
            next(e)
        }
    }

}

module.exports = new UserController;
