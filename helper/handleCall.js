require("express-async-errors");

const handleCall = async (action, next) => {
	try {
		await action();
	} catch (e) {
		next(e);
	}
};

module.exports = handleCall;
