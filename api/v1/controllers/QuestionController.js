const status = require("http-status");

const response = require("../../../utility/response");
const QuestionRepository = require("../../../repositories/QuestionRepository");
const validateCreateQuestion = require("../../../validations/question/validate-create-question");


class QuestionController {


    async create(req, res, next) {
        const {error} = validateCreateQuestion(req.body);
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }
        const {question} = req.body;
        const {userId: user} = req.user;
        const newQuestion = {
            question, user
        };
        try {
            const question = await QuestionRepository.create(newQuestion);
            return response.sendSuccess({
                res,
                statusCode: status.CREATED,
                message: "Question created successfully",
                body: question
            });
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const questions = await QuestionRepository.getAll();
            return response.sendSuccess({res, body: questions, message: "All questions"});
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new QuestionController;
