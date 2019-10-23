const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const AuthController = require("../controllers/AuthController");


router.post("/", UserController.create);
router.post("/login", AuthController.login);

router.get("/", UserController.getAll);
router.get("/:id", UserController.getOne);



module.exports = router;
