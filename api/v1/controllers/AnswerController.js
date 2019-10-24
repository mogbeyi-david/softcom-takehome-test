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
        const {answer, question} = req.body;
        const {userId: user} = req.user;
        let newAnswer = {
            answer, user, question
        };
        try {
            newAnswer = await AnswerRepository.create(newAnswer);
            if (newAnswer && newAnswer._id) {
                await QuestionRepository.addAnswers(question, newAnswer._id);
            }
            return response.sendSuccess({res, message: "Question Answered successfully", body: newAnswer});
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AnswerController();
