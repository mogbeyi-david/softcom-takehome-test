require("dotenv").config();
const mongoose = require("mongoose");
const mongoosastic = require("mongoosastic");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

UserSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({
        userId: this._id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        isAdmin: this.isAdmin
    }, JWT_SECRET_KEY);
};

UserSchema.plugin(mongoosastic, {
    "host": process.env.APP_URL,
    "port": process.env.ELASTIC_SEARCH_PORT || 9200
});

// Creates the user model
const User = mongoose.model("User", UserSchema);
User.createMapping((err, mapping) => {
    console.log('mapping created');
});

User.on('es-indexed', (err, result) => {
    console.log('indexed to elastic search');
});

module.exports = User;
