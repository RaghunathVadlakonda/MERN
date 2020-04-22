const express = require('express');
const router = express.Router();

// @route           GET api/profile
// @Description     Test route for profile
// @Access          Public route
router.get('/', (req, res) => {
    res.send('Profile route');
});

module.exports = router;