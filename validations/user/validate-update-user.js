const Joi = require("@hapi/joi");

/**
 *
 * @param user
 * @returns {*}
 */
const validateUpdateUser = (user) => {
	const schema = Joi.object({
		firstname: Joi.string()
			.required(),
		lastname: Joi.string()
			.required(),
		email: Joi.string()
			.email({minDomainSegments: 2, tlds: {allow: ["com", "net"]}})
			.required(),
		newPassword: Joi.string().allow("").optional(),
		confirmNewPassword: Joi.string().allow("").optional(),
		oldPassword: Joi.string().allow("").optional()

	});
	return schema.validate(user);
};

module.exports = validateUpdateUser;
