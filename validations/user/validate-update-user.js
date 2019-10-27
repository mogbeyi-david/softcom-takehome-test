const Joi = require('@hapi/joi')

/**
 *
 * @param user
 * @returns {*}
 */
const validateUpdateUser = (user) => {
    const schema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().allow('').required("Please enter your password")
    })
    return schema.validate(user)
}

module.exports = validateUpdateUser
