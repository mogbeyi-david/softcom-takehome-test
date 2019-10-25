const status = require("http-status");
const _ = require("lodash");

const UserRepository = require("../../../repositories/UserRepository");

const validateCreateUser = require("../../../validations/user/validate-create-user");
const validateUpdateUser = require("../../../validations/user/validate-update-user");
const response = require("../../../utility/response");
const hasher = require("../../../utility/hasher");

class UserController {

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
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
            result.on('es-indexed', function (err, res) {
                if (err) {
                    console.log("Error while trying to index", err)
                }
                console.log("Document indexed successfully", res);
            });
            const user = _.pick(result, ["_id", "firstname", "lastname", "email"]);
            return response.sendSuccess({
                res,
                message: "User created successfully",
                body: user,
                statusCode: status.CREATED
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getAll(req, res, next) {
        try {
            const users = await UserRepository.findAll();
            return response.sendSuccess({res, body: users});
        } catch (e) {
            next(e);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getOne(req, res, next) {
        try {
            const {id} = req.params;
            const user = await UserRepository.findOne(id);
            if (!user) {
                return response.sendError({res, message: "User not found", statusCode: status.NOT_FOUND});
            }
            return response.sendSuccess({res, body: user});
        } catch (e) {
            next(e);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async update(req, res, next) {

        try {

            const {error} = validateUpdateUser(req.body);
            if (error) return response.sendError({res, message: error.details[0].message});

            let {id} = req.params;
            let {firstname, lastname, email, oldPassword, newPassword, confirmNewPassword} = req.body;
            const existingUser = await UserRepository.findOne(id);
            if (!existingUser) {
                return response.sendError({res, message: "User does not exist", statusCode: status.NOT_FOUND});
            }

            if (newPassword !== confirmNewPassword) return response.sendError({res, message: "Passwords do not match"});

            if (newPassword !== "") {
                if (!await hasher.comparePasswords(oldPassword, existingUser.password)) {
                    return response.sendError({res, message: "Old password is not correct"});
                }
                if (!/^[a-zA-Z0-9]{3,30}$/.test(newPassword)) {
                    return response.sendError({res, message: "Password is not secure enough"});
                }
            }
            let user = {firstname, lastname, email};
            if (newPassword) {
                user.password = newPassword;
            }
            const result = await UserRepository.update(user, id);
            user = _.pick(result, ["firstname", "lastname", "email"]);
            return response.sendSuccess({res, message: "User details updated successfully", body: user});
        } catch (e) {
            next(e);
        }
    }

}

module.exports = new UserController;
