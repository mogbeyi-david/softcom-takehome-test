const Question = require("../models/Question");

class QuestionRepository {

    /**
     *
     * @param question
     */
    constructor(question) {
        this.question = question;
    }

    /**
     *
     * @param question
     * @returns {Promise<void>}
     */
    async create(question) {
        return await this.question.create(question);
    }

    /**
     *
     * @returns {Promise<*>}
     */
    async getAll() {
        return await this.question.find({});
    }

    /**
     *
     * @param id
     * @returns {Promise<*>}
     */
    async getOne(id) {
        return await this.question.findOne({_id: id});
    }

}

module.exports = new QuestionRepository(Question);
