const Joi = require("@hapi/joi");

/**
 *
 * @param answer
 * @returns {*}
 */
const validateCreateAnswer = (answer) => {
	const schema = Joi.object({
		question: Joi.string()
			.required(),
		answer: Joi.string()
			.required()
	});
	return schema.validate(answer);
};

module.exports = validateCreateAnswer;
