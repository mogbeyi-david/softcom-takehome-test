require('dotenv').config()
const _ = require('lodash')
const status = require('http-status')

const validateUser = require('../../../validations/login')
const validateChangeUserPassword = require('../../../validations/user/validate-change-user-password')
const response = require('../../../utility/response')
const hasher = require('../../../utility/hasher')
const mailer = require('../../../utility/mailer')
const UserRepository = require('../../../repositories/UserRepository')
const handleCall = require('../../../helper/handleCall')

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
    async login (req, res, next)
    {
        const { error } = validateUser(req.body) // Check if the request payload meets required parameters
        if (error) {
            return response.sendError({ res, message: error.details[0].message })
        }
        let { email, password } = req.body
        return handleCall((async () => {
            const user = await UserRepository.findByEmail(email)
            if (!user) {
                return response.sendError(
                  { res, message: 'Email or Password is Incorrect' })
            }
            const validPassword = await hasher.comparePasswords(password,
              user.password)
            if (!validPassword) {
                return response.sendError(
                  { res, message: 'Email or Password is Incorrect' })
            }
            const token = user.generateJsonWebToken()
            let result = _.pick(user, ['firstname', 'lastname', 'email'])
            result.token = token
            res.header('x-auth-token', token)
            return response.sendSuccess(
              { res, body: result, message: 'Login successful' })
        }), next)
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async sendResetPasswordLink (req, res, next)
    {
        return handleCall((async () => {
            const { email } = req.body
            if (!email) return response.sendError(
              { res, message: 'Email is required' })

            const user = await UserRepository.findByEmail(email)
            if (user) mailer.sendPasswordResetLink(user.email)
            return response.sendSuccess({
                res,
                message: 'Please check your email for further instructions on resetting your password',
            })
        }), next)
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async resetPassword (req, res, next)
    {
        return handleCall((async () => {
            let { email } = req.query
            if (!email) return response.sendError({ res, message: 'Email is required' })

            let { password, confirmPassword } = req.body
            if (password !== confirmPassword) return response.sendError(
              { res, message: 'Passwords do not match' })
            let user = await UserRepository.findByEmail(email)
            if (!user) return response.sendError({
                res,
                message: 'User does not exist',
                statusCode: status.NOT_FOUND,
            })
            password = await hasher.encryptPassword(password)
            user.password = password
            const result = await user.save()
            user = _.pick(result, ['_id', 'firstname', 'lastname', 'email'])
            return response.sendSuccess(
              { res, message: 'Password reset successfully', body: user })
        }), next)
    }

    async changePassword (req, res, next)
    {
        const { id } = req.params
        const { oldPassword, newPassword, confirmNewPassword } = req.body
        const { userId: user, isAdmin } = req.user
        if (user.toString() !== id.toString() && !isAdmin) {
            return response.sendError(
              { res, message: 'You are not authorized to perform this operation', statusCode: status.UNAUTHORIZED })
        }
        const { error } = validateChangeUserPassword(req.body) // Check if the request payload meets specifications
        if (error) {
            return response.sendError({ res, message: error.details[0].message })
        }

        if (newPassword !== confirmNewPassword) {
            return response.sendError({ res, message: 'Passwords do not match' })
        }

        return handleCall((async () => {
            let user = await UserRepository.findOne(id)
            if (!user) {
                return response.sendError({ res, statusCode: status.NOT_FOUND, message: 'User not found' })
            }
            const isValidPassword = hasher.comparePasswords(oldPassword, user.password)
            if (!isValidPassword) {
                return response.sendError({ res, message: 'Old password is not correct' })
            }
            const result = await UserRepository.update({ password: newPassword }, id)
            user = _.pick(result, ['firstname', 'lastname', 'email'])
            return response.sendSuccess({ res, message: 'User password updated successfully', body: user })
        }), next)
    }

}

module.exports = new AuthController
