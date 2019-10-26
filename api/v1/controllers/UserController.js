const status = require("http-status");
const _ = require("lodash");
const mongoose = require("mongoose");

const UserRepository = require("../../../repositories/UserRepository");

const validateCreateUser = require("../../../validations/user/validate-create-user");
const validateUpdateUser = require("../../../validations/user/validate-update-user");
const response = require("../../../utility/response");
const hasher = require("../../../utility/hasher");
const handleCall = require("../../../helper/handleCall");

class UserController {

    /**
     * @Author David Mogbeyi
     * @Responsibility: Creates a new user
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async create(req, res, next) {

        const {error} = validateCreateUser(req.body); // Check if the request payload meets specifications
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }
        let {firstname, lastname, email, password} = req.body;
        handleCall((async () => {
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
        }));
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getAll(req, res, next) {
        handleCall((async () => {
            const users = await UserRepository.findAll();
            return response.sendSuccess({res, body: users, message: "All users"});
        }));
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getOne(req, res, next) {
        handleCall((async () => {
            let {id} = req.params;
            id = mongoose.Types.ObjectId(id);
            const result = await UserRepository.findOne(id);
            if (!result) {
                return response.sendError({res, message: "User not found", statusCode: status.NOT_FOUND});
            }
            const user = _.pick(result, ["_id", "firstname", "lastname", "email"]);
            return response.sendSuccess({res, body: user, message: "Single user gotten successfully"});
        }));
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
