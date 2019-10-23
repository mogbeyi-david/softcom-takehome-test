const Question = require("../models/Question");

class QuestionRepository {

    /**
     *
     * @param question
     */
    constructor(question) {
        this.question = question;
    }

}

module.exports = new QuestionRepository(Question);
