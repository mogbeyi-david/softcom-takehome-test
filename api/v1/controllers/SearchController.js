const response = require("../../../utility/response");
const UserRepository = require("../../../repositories/UserRepository");
const AnswerRepository = require("../../../repositories/AnswerRepository");
const QuestionRepository = require("../../../repositories/QuestionRepository");
const handleCall = require("../../../helper/handleCall");

class SearchController {

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async searchUser (req, res, next) {
        const { query } = req.query;
        let hits;
        return handleCall((async () => {
            const result = await UserRepository.search(query);
            if (!result || !result.hits) {
                return response.sendError({ res, message: `No results found for ${query}` });
            }
            hits = result.hits.hits.map((hit) => {
                return hit._source;
            });
            return response.sendSuccess({ res, message: `Search for User: ${query}`, body: hits });
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async searchAnswer (req, res, next) {
        const { query } = req.query;
        let hits;
        return handleCall((async () => {
            const result = await AnswerRepository.search(query);
            if (!result || !result.hits) {
                return response.sendError({ res, message: `No results found for ${query}` });
            }
            hits = result.hits.hits.map((hit) => {
                return hit._source;
            });
            return response.sendSuccess({ res, message: `Search for Answer: ${query}`, body: hits });
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async searchQuestion (req, res, next) {
        const { query } = req.query;
        let hits;
        return handleCall((async () => {
            const result = await QuestionRepository.search(query);
            if (!result || !result.hits) {
                return response.sendError({ res, message: `No results found for ${query}` });
            }
            hits = result.hits.hits.map((hit) => {
                return hit._source;
            });
            return response.sendSuccess({ res, message: `Search for Question: ${query}`, body: hits });
        }), next);
    }
}

module.exports = new SearchController;
