const express = require("express");
const router = express.Router();
const QuestionController = require("../controllers/QuestionController");
const authMiddleware = require("../../../middlewares/auth");
const validateObjectIdMiddleware = require("../../../middlewares/validate-objectId");

router.post("/", authMiddleware, QuestionController.create);

router.get("/", QuestionController.getAll);
router.get("/:id", [validateObjectIdMiddleware], QuestionController.getOne);

router.put("/:id", [validateObjectIdMiddleware, authMiddleware], QuestionController.update);


module.exports = router;
