const User = require("../models/User");

class UserRepository {

    /**
     *
     * @param user
     */
    constructor(user) {
        this.user = user;
    }

    async create(user) {
        return await this.user.create(user);
    }

    async findByEmail(email) {
        return await this.user.findOne({email});
    }

}

module.exports = new UserRepository(User);
