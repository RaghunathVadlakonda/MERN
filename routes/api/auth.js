const express = require('express');
const router = express.Router();

// @route           GET api/auth
// @Description     Test route for auth
// @Access          Public route
router.get('/', (req, res) => {
    res.send('Auth route');
});

module.exports = router;