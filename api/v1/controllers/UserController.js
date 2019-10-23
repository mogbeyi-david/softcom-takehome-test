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
        let {firstname, lastname, email, password} = req.body;

        try {

            const existingUser = await UserRepository.findByEmail(email);
            if (existingUser) {
                return response.sendError({res, message: "User already exists"});
            }
            password = await hasher.encryptPassword(password);
            const result = await UserRepository.create({firstname, lastname, email, password});
            const user = _.pick(result, ["_id", "firstname", "lastname", "email"]);
            return response.sendSuccess({
                res,
                message: "User created successfully",
                body: user,
                statusCode: status.CREATED
            });
        } catch (e) {
            next(e)
        }
    }

}

module.exports = new UserController;
