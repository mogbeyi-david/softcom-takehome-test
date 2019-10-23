const status = require("http-status");


class Response {

    /**
     *
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @returns {*}
     */
    static sendSuccess({res, statusCode = status.OK, message = "Successful Operation", body = {}}) {
        return res.status(statusCode).send({message, body});
    }

    /**
     *
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @returns {*}
     */
    static sendError({res, statusCode = status.BAD_REQUEST, message = "Failed Operation", body = {}}) {
        return res.status(statusCode).send({message, body});
    }

    /**
     *
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @param error
     * @param stack
     * @returns {*}
     */
    static sendFatalError({
                              res, statusCode = status.INTERNAL_SERVER_ERROR,
                              message = "Oops, something went wrong", body = {},
                              error, stack
                          }) {
        return res.status(statusCode).send({message, body, error, stack});
    }
}

module.exports = Response;
