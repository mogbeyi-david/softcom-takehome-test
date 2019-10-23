const express = require("express");
const router = express.Router();
const QuestionController = require("../controllers/QuestionController");
const authMiddleware = require("../../../middlewares/auth");

router.post("/", authMiddleware, QuestionController.create);

router.get("/", QuestionController.getAll);


module.exports = router;
