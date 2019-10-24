const Joi = require("@hapi/joi");

/**
 *
 * @param user
 * @returns {*}
 */
const validateQuestion = (user) => {
	const schema = Joi.object({
		question: Joi.string()
			.required()
	});
	return schema.validate(user);
};

module.exports = validateQuestion;
