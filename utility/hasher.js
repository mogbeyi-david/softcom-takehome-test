const bcrypt = require("bcrypt");


class Hasher {

	/**
     *
     * @param password
     * @returns {Promise<void>}
     */
	static async encryptPassword(password) {
		const SALT_FACTOR = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, SALT_FACTOR);
	}

	/**
     *
     * @param givenPassword
     * @param actualPassword
     * @returns {Promise<void>}
     */
	static async comparePasswords(givenPassword, actualPassword) {
		return await bcrypt.compare(givenPassword, actualPassword);
	}

}

module.exports = Hasher;
