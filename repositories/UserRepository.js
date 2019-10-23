const User = require("../models/User");

class UserRepository {

    /**
     *
     * @param user
     */
    constructor(user) {
        this.user = user;
    }

}

module.exports = new UserRepository(User);
