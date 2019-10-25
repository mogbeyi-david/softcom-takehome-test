const Subscription = require("../models/Subscription");
const rabbitMqService = require("./rabbitmq");

class SubscriptionService {

    /**
     *
     * @param subscribers
     */
    static notifySubscribersToQuestion(subscribers) {
        return rabbitMqService.publish("notify-subscribers-to-question", subscribers);
    }


}

module.exports = SubscriptionService;
