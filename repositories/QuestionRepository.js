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
	async findAll() {
		return await this.question.find({}).lean();
	}

	/**
     *
     * @param id
     * @returns {Promise<*>}
     */
	async findOne(id) {
		return await this.question.findOne({_id: id});
	}

	async update(id, data) {
		return await this.question.findOneAndUpdate({_id: id}, data, {new: true});
	}

}

module.exports = new QuestionRepository(Question);
