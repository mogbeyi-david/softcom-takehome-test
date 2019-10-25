require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const QuestionSchema = new Schema({
	question: {
		type: String,
		required: true
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
		ref: "User"
	},
	answers: [
		{
			type: Schema.Types.ObjectId,
			ref: "Answer"
		}
	]
}, {timestamps: true});

// Creates the question model
const Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;
