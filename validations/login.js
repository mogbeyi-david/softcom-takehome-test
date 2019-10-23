const Joi = require("@hapi/joi");

/**
 *
 * @param userDetails
 * @returns {*}
 */
const validateLogin = (userDetails) => {
	const schema = Joi.object({
		email: Joi.string()
			.email({minDomainSegments: 2, tlds: {allow: ["com", "net"]}})
			.required(),
		password: Joi.string()
			.required()
			.pattern(/^[a-zA-Z0-9]{3,30}$/),
	});
	return schema.validate(userDetails);
};

module.exports = validateLogin;