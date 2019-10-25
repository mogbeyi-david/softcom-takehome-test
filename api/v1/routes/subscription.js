const express = require("express");
const router = express.Router();
const SubscriptionController = require("../controllers/SubscriptionController");


router.post("/subscribe/question", SubscriptionController.subscribeToQuestion);


module.exports = router;
