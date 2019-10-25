require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const AnswerSchema = new Schema({
	answer: {
		type: String,
		required: true
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
		ref: "User"
	},
	question: {
		type: Schema.Types.ObjectId,
		ref: "Question"
	}
}, {timestamps: true});

// Creates the answer model
const Answer = mongoose.model("Answer", AnswerSchema);
module.exports = Answer;
