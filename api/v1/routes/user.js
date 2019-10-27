const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const AuthController = require('../controllers/AuthController')
const validateObjectIdMiddleware = require('../../../middlewares/validate-objectId')
const authMiddleware = require('../../../middlewares/auth')

router.post('/forgot-password', AuthController.sendResetPasswordLink)
router.post('/reset-password', AuthController.resetPassword)
router.post('/login', AuthController.login)
router.post('/', UserController.create)

router.get('/', UserController.getAll)
router.get('/:id', [validateObjectIdMiddleware], UserController.getOne)

router.put('/:id', [validateObjectIdMiddleware], UserController.update)

module.exports = router
