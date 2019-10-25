const handleCall = (action) => {
    try {
        action()
    } catch (e) {
        next(e)
    }
};

module.exports = handleCall;
