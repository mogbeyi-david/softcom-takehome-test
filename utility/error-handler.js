require("dotenv").config();
const response = require("./response");

class ErrorHandler {


	static handle(err, req, res) {
		let stack = process.env.NODE_ENV === "development" ? err.stack : null;
		return response.sendFatalError({res, error: err.errors, message: err.message, stack});
	}

}

module.exports = ErrorHandler;
