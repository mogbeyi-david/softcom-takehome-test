const Joi = require("@hapi/joi");

/**
 *
 * @param subscription
 * @returns {*}
 */
const validateSubscribeToQuestion = (subscription) => {
	const schema = Joi.object({
		question: Joi.string()
			.required(),
		user: Joi.string()
			.required()
	});
	return schema.validate(subscription);
};

module.exports = validateSubscribeToQuestion;
