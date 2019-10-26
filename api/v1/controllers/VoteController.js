const status = require("http-status");

const response = require("../../../utility/response");
const QuestionRepository = require("../../../repositories/QuestionRepository");
const AnswerRepository = require("../../../repositories/AnswerRepository");
const handleCall = require("../../../helper/handleCall");


class VoteController {

	/**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
	async voteAnswer(req, res, next) {
		const {id} = req.params;
		const {up} = req.query;
		let message;
		return handleCall((async () => {
			const answer = await AnswerRepository.findOne(id);
			if (!answer) {
				return response.sendError({res, statusCode: status.NOT_FOUND, message: "Answer not found"});
			}
			if (!up || parseInt(up)) {
				answer.upVotes++;
				message = "Answer up-voted successfully";
			} else {
				answer.downVotes++;
				message = "Answer down-voted successfully";
			}
			const result = await answer.save();
			return response.sendSuccess({res, message, body: result});
		}), next);
	}

	async voteQuestion(req, res, next) {
		const {id} = req.params;
		const {up} = req.query;
		let message;
		return handleCall((async () => {
			const question = await QuestionRepository.findOne(id);
			if (!question) {
				return response.sendError({res, statusCode: status.NOT_FOUND, message: "Question not found"});
			}
			if (!up || parseInt(up)) {
				question.upVotes++;
				message = "Question up-voted successfully";
			} else {
				question.downVotes++;
				message = "Question down-voted successfully";
			}
			const result = await question.save();
			return response.sendSuccess({res, message, body: result});
		}), next);
	}
}

module.exports = new VoteController();
