require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mexp = require('mongoose-elasticsearch-xp').v7;


const AnswerSchema = new Schema({
    answer: {
        type: String,
        required: true,
        es_indexed: true
    },
    upVotes: {
        type: Number,
        default: 0,
    },
    downVotes: {
        type: Number,
        default: 0
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        es_indexed: true
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        es_indexed: true
    }
}, {timestamps: true});

AnswerSchema.plugin(mexp);

// Creates the answer model
const Answer = mongoose.model("Answer", AnswerSchema);
module.exports = Answer;
