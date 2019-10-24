const express = require("express");
const router = express.Router();
const QuestionController = require("../controllers/QuestionController");
const VoteController = require("../controllers/VoteController");
const authMiddleware = require("../../../middlewares/auth");
const validateObjectIdMiddleware = require("../../../middlewares/validate-objectId");

router.post("/", authMiddleware, QuestionController.create);

router.get("/", QuestionController.getAll);
router.get("/:id", [validateObjectIdMiddleware], QuestionController.getOne);

// PUT REQUESTS
router.put("/:id/vote", [validateObjectIdMiddleware, authMiddleware], VoteController.voteQuestion);
router.put("/:id", [validateObjectIdMiddleware, authMiddleware], QuestionController.update);


module.exports = router;
