require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const QuestionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    views: {
        type: Number
    },
    upVotes: {
        type: Number
    },
    downVotes: {
        type: Number
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

// Creates the question model
const Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;
