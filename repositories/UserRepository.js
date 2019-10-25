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
        return await this.user.find({}, {password: false, isAdmin: false}).lean();
    }

    /**
     *
     * @param id
     * @returns {Promise<*|TInstance|T>}
     */
    async findOne(id) {
        return await this.user.findOne({_id: id});
    }

    /**
     *
     * @param user
     * @param id
     * @returns {Promise<void>}
     */
    async update(user, id) {
        return await this.user.findOneAndUpdate({_id: id}, user, {new: true});
    }

    async search(query) {
        return this.user.esSearch({
            query_string: {
                query
            }
        })
    }

}

module.exports = new UserRepository(User);
