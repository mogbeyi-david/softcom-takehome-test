const Joi = require("@hapi/joi");

/**
 *
 * @param answer
 * @returns {*}
 */
const validateUpdateAnswer = (answer) => {
	const schema = Joi.object({
		answer: Joi.string()
			.required()
	});
	return schema.validate(answer);
};

module.exports = validateUpdateAnswer;
