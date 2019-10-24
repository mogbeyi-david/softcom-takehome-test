const Joi = require("@hapi/joi");

/**
 *
 * @param user
 * @returns {*}
 */
const validateCreateAnswer = (user) => {
    const schema = Joi.object({
        question: Joi.string()
            .required(),
        answer: Joi.string()
            .required()
    });
    return schema.validate(user);
};

module.exports = validateCreateAnswer;
