require('dotenv').config();
const _ = require('lodash');
const status = require('http-status');

const validateUser = require('../../../validations/login');
const response = require('../../../utility/response');
const hasher = require('../../../utility/hasher');
const mailer = require('../../../utility/mailer');
const UserRepository = require('../../../repositories/UserRepository');
const handleCall = require('../../../helper/handleCall');

class AuthController
{

    /**
     *@author David Mogbeyi
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async login(req, res, next)
    {
        const {error} = validateUser(req.body); // Check if the request payload meets required parameters
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }
        let {email, password} = req.body;
        handleCall((async () => {
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                return response.sendError(
                    {res, message: 'Email or Password is Incorrect'});
            }
            const validPassword = await hasher.comparePasswords(password,
                user.password);
            if (!validPassword) {
                return response.sendError(
                    {res, message: 'Email or Password is Incorrect'});
            }
            const token = user.generateJsonWebToken();
            const result = _.pick(user, ['firstname', 'lastname', 'email']);
            res.header('x-auth-token', token);
            return response.sendSuccess(
                {res, body: result, message: 'Login successful'});
        }));
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async sendResetPasswordLink(req, res, next)
    {
        handleCall((async () => {
            const {email} = req.body;
            if (!email) return response.sendError(
                {res, message: 'Email is required'});

            const user = await UserRepository.findByEmail(email);
            if (user) mailer.sendPasswordResetLink(user.email);
            return response.sendSuccess({
                res,
                message: 'Please check your email for further instructions on resetting your password',
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
    async resetPassword(req, res, next)
    {
        handleCall((async () => {
            let {email} = req.query;
            if (!email) return response.sendError(
                {res, message: 'Email is required'});

            let {password, confirmPassword} = req.body;
            if (password !== confirmPassword) return response.sendError(
                {res, message: 'Passwords do not match'});
            let user = await UserRepository.findByEmail(email);
            if (!user) return response.sendError({
                res,
                message: 'User does not exist',
                statusCode: status.NOT_FOUND,
            });
            password = await hasher.encryptPassword(password);
            user.password = password;
            const result = await user.save();
            user = _.pick(result, ['_id', 'firstname', 'lastname', 'email']);
            return response.sendSuccess(
                {res, message: 'Password reset successfully', body: user});
        }));
    }

}

module.exports = new AuthController;
