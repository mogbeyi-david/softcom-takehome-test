const express = require("express");
const router = express.Router();
const AnswerController = require("../controllers/AnswerController");
const VoteController = require("../controllers/VoteController");
const authMiddleware = require("../../../middlewares/auth");
const validateObjectIdMiddleware = require("../../../middlewares/validate-objectId");

router.post("/", authMiddleware, AnswerController.create);


module.exports = router;
