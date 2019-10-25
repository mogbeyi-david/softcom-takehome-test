const status = require("http-status");
const response = require("../../../utility/response");
const validateSubscribeToQuestion = require("../../../validations/subscription/validate-subscribe-to-question");
const SubscriptionRepository = require("../../../repositories/SubscriptionRepository");
const UserRepository = require("../../../repositories/UserRepository");
const QuestionRepository = require("../../../repositories/QuestionRepository");

class SubscriptionController {

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async subscribeToQuestion(req, res, next) {

        const {error} = validateSubscribeToQuestion(req.body);
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }
        let {user, question} = req.body;
        try {
            const existingUser = await UserRepository.findOne(user);
            if (!existingUser) {
                return response.sendError({res, statusCode: status.NOT_FOUND, message: "User does not exist"});
            }

            const existingQuestion = await QuestionRepository.findOne(question);
            if (!existingQuestion) {
                return response.sendError({res, statusCode: status.NOT_FOUND, message: "Question does not exist"});
            }
            const newSubscription = await SubscriptionRepository.subscribeToQuestion(question, user);
            return response.sendSuccess({
                res,
                message: "User subscribed to question successfully",
                statusCode: status.CREATED,
                body: newSubscription
            })
        } catch (e) {
            next(e)
        }
    }

}

module.exports = new SubscriptionController();
