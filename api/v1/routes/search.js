const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/SearchController');

router.get('/user', SearchController.searchUser);
router.get('/answer', SearchController.searchAnswer);
router.get('/question', SearchController.searchQuestion);

module.exports = router;
