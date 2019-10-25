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

    async getAllForQuestion(question) {
        return await this.subscription.find({question}).lean();
    }

}

module.exports = new SubscriptionRepository(Subscription);
