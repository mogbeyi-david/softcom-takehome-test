const status = require("http-status");

const response = require("../../../utility/response");
const AnswerRepository = require("../../../repositories/AnswerRepository");
const validateCreateAnswer = require("../../../validations/answer/validate-create-answer");

class AnswerController {


    create(req, res, next) {

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
            newAnswer = await AnswerRepository.create()
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AnswerController();
