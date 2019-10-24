const Joi = require("@hapi/joi");

/**
 *
 * @param user
 * @returns {*}
 */
const validateCreateAnswer = (user) => {
    const schema = Joi.object({
        answer: Joi.string()
            .required()
    });
    return schema.validate(user);
};

module.exports = validateCreateAnswer;
