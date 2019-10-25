const rabbitMqService = require("./rabbitmq");

class SubscriptionService {

	/**
     *
     * @param data
     */
	static notifySubscribersToQuestion(data) {
		return rabbitMqService.publish("notify-subscribers-to-question", data);
	}


}

module.exports = SubscriptionService;
