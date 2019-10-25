const express = require("express");
const router = express.Router();
const SubscriptionController = require("../controllers/SubscriptionController");
const authMiddleware = require("../../../middlewares/auth");


router.post("/question", [authMiddleware], SubscriptionController.subscribeToQuestion);


module.exports = router;
