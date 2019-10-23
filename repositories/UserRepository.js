const User = require("../models/User");

class UserRepository {

    /**
     *
     * @param user
     */
    constructor(user) {
        this.user = user;
    }

    /**
     *
     * @param user
     * @returns {Promise<void>}
     */
    async create(user) {
        return await this.user.create(user);
    }

    /**
     *
     * @param email
     * @returns {Bluebird<TInstance | T>}
     */
    async findByEmail(email) {
        return await this.user.findOne({email});
    }

    /**
     *
     * @returns {Promise<*>}
     */
    async findAll() {
        return await this.user.find({}, {password: false, isAdmin: false});
    }

}

module.exports = new UserRepository(User);
