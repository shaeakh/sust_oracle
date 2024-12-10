const express = require('express');
const router = express.Router();
const { getUser, updateUser, getAllUsers, getUserById } = require('../controllers/user');
const validateJWT = require('../utils/validateJWT');

router.get('/profile', validateJWT, getUser);
router.put('/profile', validateJWT, updateUser);
router.get('/all-users', validateJWT, getAllUsers);
router.get('/:id', validateJWT, getUserById);

module.exports = router;