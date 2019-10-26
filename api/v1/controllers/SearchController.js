const status = require("http-status");

const response = require("../../../utility/response");
const UserRepository = require("../../../repositories/UserRepository");
const AnswerRepository = require("../../../repositories/AnswerRepository");
const QuestionRepository = require("../../../repositories/QuestionRepository");

class SearchController {

	/**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
	async search(req, res, next) {
		const {query} = req.query;
		let hits;
		try {
			const result = await UserRepository.search(query);
			if (!result || !result.hits) {
				return response.sendError({res, message: `No results found for ${query}`});
			}
			hits = result.hits.hits;
			return response.sendSuccess({res, message: `Search for ${query}`, body: hits});
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new SearchController;
