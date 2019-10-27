const Joi = require("@hapi/joi");

/**
 *
 * @param payload
 * @returns {*}
 */
const validateResetPassword = (payload) => {
	const schema = Joi.object({
		password: Joi.string().required().pattern(/^[a-zA-Z0-9]{3,30}$/),
		confirmPassword: Joi.string().required().pattern(/^[a-zA-Z0-9]{3,30}$/),

	});
	return schema.validate(payload);
};

module.exports = validateResetPassword;
