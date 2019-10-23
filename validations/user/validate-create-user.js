const Joi = require("@hapi/joi");

/**
 *
 * @param user
 * @returns {*}
 */
const validateUser = (user) => {
	const schema = Joi.object({
		firstname: Joi.string()
			.required(),
		lastname: Joi.string()
			.required(),
		email: Joi.string()
			.email({minDomainSegments: 2, tlds: {allow: ["com", "net"]}})
			.required(),
		password: Joi.string()
			.required()
			.pattern(/^[a-zA-Z0-9]{3,30}$/),

	});
	return schema.validate(user);
};

module.exports = validateUser;