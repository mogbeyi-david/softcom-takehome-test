require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const SubscriptionSchema = new Schema({
	question: {
		type: Schema.Types.ObjectId,
		ref: "Question"
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		unique: true
	}
}, {timestamps: true});

// Creates the subscription model
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
module.exports = Subscription;
