require("dotenv").config();
const rabbitMqService = require("../services/rabbitmq");
const queue = process.env.RESET_PASSWORD_QUEUE;


class Mailer {

	/**
     *
     * @param email
     */
	static sendPasswordResetLink(email) {
		return rabbitMqService.publish(queue, {email});
	}
}

module.exports = Mailer;
