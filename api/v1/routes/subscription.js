const express = require("express");
const router = express.Router();
const SubscriptionController = require("../controllers/SubscriptionController");
const authMiddleware = require("../../../middlewares/auth");
const adminMiddleware = require("../../../middlewares/admin");


router.post("/question", [authMiddleware], SubscriptionController.subscribeToQuestion);
router.get("/question/:id", [authMiddleware, adminMiddleware], SubscriptionController.getAllForQuestion);


module.exports = router;
