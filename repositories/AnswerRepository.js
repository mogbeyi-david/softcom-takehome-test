const Answer = require("../models/Answer");

class AnswerRepository {

	/**
     *
     * @param answer
     */
	constructor(answer) {
		this.answer = answer;
	}

	/**
     *
     * @param answer
     * @returns {Promise<void>}
     */
	async create(answer) {
		return await this.answer.create(answer);
	}

	/**
     *
     * @returns {Promise<*>}
     */
	async findAll() {
		return await this.answer.find({}).populate("question").lean();
	}

	/**
     *
     * @param id
     * @returns {Promise<*>}
     */
	async findOne(id) {
		return await this.answer.findOne({_id: id});
	}

	/**
     *
     * @param id
     * @param data
     * @returns {Promise<void>}
     */
	async update(id, data) {
		return await this.answer.findOneAndUpdate({_id: id}, data, {new: true});
	}

	async findAllForQuestion(question) {
		return await this.answer.find({question}).lean();
	}

}

module.exports = new AnswerRepository(Answer);
