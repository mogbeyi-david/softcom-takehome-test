require("dotenv").config();
const _ = require("lodash");
const status = require("http-status");


const validateUser = require("../../../validations/login");
const response = require("../../../utility/response");
const hasher = require("../../../utility/hasher");
const mailer = require("../../../utility/mailer");
const UserRepository = require("../../../repositories/UserRepository");

class AuthController {

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async login(req, res, next) {

        const {error} = validateUser(req.body);
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }

        let {email, password} = req.body;
        try {
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                return response.sendError({res, message: "Email or Password is Incorrect"});
            }

            const validPassword = await hasher.comparePasswords(password, user.password);
            if (!validPassword) {
                return response.sendError({res, message: "Email or Password is Incorrect"});
            }
            const token = user.generateJsonWebToken();
            const result = _.pick(user, ["firstname", "lastname", "email"]);
            res.header("x-auth-token", token);
            return response.sendSuccess({res, body: result, message: "Login successful"});
        } catch (e) {
            next(e);
        }

    }

}

module.exports = new AuthController;
