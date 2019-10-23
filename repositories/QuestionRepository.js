const Question = require("../models/Question");

class QuestionRepository {

    /**
     *
     * @param question
     */
    constructor(question) {
        this.question = question;
    }

    async create(question) {
        return await this.question.create(question);
    }

}

module.exports = new QuestionRepository(Question);
