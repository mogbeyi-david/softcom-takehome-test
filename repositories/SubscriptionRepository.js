const Subscription = require("../models/Subscription");


class SubscriptionRepository {

    /**
     *
     * @param subscription
     */
    constructor(subscription) {
        this.subscription = subscription;
    }

    /**
     *
     * @param question
     * @param user
     * @returns {Promise<Document>}
     */
    async subscribeToQuestion(question, user) {
        return await this.subscription.create({
            question, user
        })
    }

}

module.exports = new SubscriptionRepository(Subscription);
