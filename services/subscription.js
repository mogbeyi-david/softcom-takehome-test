const Subscription = require("../models/Subscription");

class SubscriptionService {

    /**
     *
     * @param question
     * @param user
     * @returns {Promise<Document>}
     */
    static async create(question, user) {
        return await Subscription.create({
            question, user
        })
    }


    publish(queue, data) {

    }
}

module.exports = SubscriptionService;
