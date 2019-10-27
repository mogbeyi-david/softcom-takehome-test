const Joi = require('@hapi/joi')

/**
 *
 * @param user
 * @returns {*}
 */
const validateChangeUserPassword = (user) => {
    const schema = Joi.object({
        oldPassword: Joi.string().allow(""),
        newPassword: Joi.string().allow(""),
        confirmNewPassword: Joi.string().allow("")
    })
    return schema.validate(user)
}

module.exports = validateChangeUserPassword
