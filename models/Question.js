require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mexp = require('mongoose-elasticsearch-xp').v7;


const QuestionSchema = new Schema({
    question: {
        type: String,
        required: true,
        es_indexed: true
    },
    views: {
        type: Number,
        default: 0
    },
    upVotes: {
        type: Number,
        default: 0
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
    answers: [
        {
            type: Schema.Types.ObjectId,
            ref: "Answer",
            es_indexed: true
        }
    ]
}, {timestamps: true});

QuestionSchema.plugin(mexp);

// Creates the question model
const Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;
