const express = require('express');
const router = express.Router();
const { getUser, updateUser, getAllUsers } = require('../controllers/user');
const validateJWT = require('../utils/validateJWT');

router.get('/profile', validateJWT, getUser);
router.put('/profile', validateJWT, updateUser);
router.get('/all-users', validateJWT, getAllUsers);

module.exports = router;