const status = require("http-status");

const response = require("../../../utility/response");
const AnswerRepository = require("../../../repositories/AnswerRepository");
const QuestionRepository = require("../../../repositories/QuestionRepository");
const validateCreateAnswer = require("../../../validations/answer/validate-create-answer");

class AnswerController {


    async create(req, res, next) {

        const {error} = validateCreateAnswer(req.body);
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }
        let {answer, question} = req.body;
        const {userId: user} = req.user;
        let newAnswer = {
            answer, user, question
        };
        try {
            newAnswer = await AnswerRepository.create(newAnswer);
            if (newAnswer && newAnswer._id) {
                question = await QuestionRepository.addAnswers(question, newAnswer._id);
            }
            if (!question) {
                return response.sendError({res, statusCode: status.NOT_FOUND, message: "Question not found"});
            }
            return response.sendSuccess({res, message: "Question Answered successfully", body: newAnswer});
        } catch (e) {
            next(e);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async findAll(req, res, next) {
        try {
            const answers = await AnswerRepository.findAll();
            return response.sendSuccess({res, message: "All answers", body: answers});
        } catch (e) {
            next(e);
        }
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    async findOne(req, res, next) {
        const {id} = req.params;
        try {
            const answer = await AnswerRepository.findOne(id);
            if (!answer) {
                return response.sendError({res, message: "Answer not found", statusCode: status.NOT_FOUND})
            }
            return response.sendSuccess({res, message: "Single answer", body: answer});
        } catch (e) {
            next(e);
        }
    }


}

module.exports = new AnswerController();
