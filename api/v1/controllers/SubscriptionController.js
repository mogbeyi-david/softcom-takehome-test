const status = require("http-status");
const response = require("../../../utility/response");
const validateSubscribeToQuestion = require("../../../validations/subscription/validate-subscribe-to-question");
const SubscriptionRepository = require("../../../repositories/SubscriptionRepository");
const UserRepository = require("../../../repositories/UserRepository");
const QuestionRepository = require("../../../repositories/QuestionRepository");
const handleCall = require("../../../helper/handleCall");


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
		let {question} = req.body;
		let {userId: user} = req.user;
		return handleCall((async () => {
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
			});
		}), next);
	}

	/**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
	async getAllForQuestion(req, res, next) {

		const {id} = req.params;
		return handleCall((async () => {
			const subscriptions = await SubscriptionRepository.getAllForQuestion(id);
			return response.sendSuccess({res, body: subscriptions, message: "Subscriptions for question"});
		}), next);
	}

}

module.exports = new SubscriptionController();
