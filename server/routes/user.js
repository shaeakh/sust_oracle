const express = require('express');
const router = express.Router();
const { getUser, updateUser } = require('../controllers/user');
const validateJWT = require('../utils/validateJWT');

router.get('/profile', validateJWT, getUser);
router.put('/profile', validateJWT, updateUser);

module.exports = router;