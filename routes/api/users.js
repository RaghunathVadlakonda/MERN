const express = require('express');
const router = express.Router();

// @route           GET api/users
// @Description     Test route for users
// @Access          Public route
router.get('/', (req, res) => {
    res.send('Users route');
});

module.exports = router;