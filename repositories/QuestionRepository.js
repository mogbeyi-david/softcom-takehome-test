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

    async getAll() {
        return await this.question.find({});
    }

}

module.exports = new QuestionRepository(Question);
