const status = require("http-status");

const response = require("../../../utility/response");
const QuestionRepository = require("../../../repositories/QuestionRepository");

class VoteController {

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async voteQuestion(req, res, next) {
        const {id} = req.params;
        const {up} = req.query;
        let message;
        try {
            const question = await QuestionRepository.findOne(id);
            if (!question) {
                return response.sendError({res, statusCode: status.NOT_FOUND, message: "Question not found"});
            }
            if (!up || parseInt(up)) {
                question.upVotes++;
                message = "Question up-voted successfully";
            } else {
                question.downVotes--;
                message = "Question down-voted successfully";
            }
            const result = await question.save();
            return response.sendSuccess({res, message, body: result});
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new VoteController();
