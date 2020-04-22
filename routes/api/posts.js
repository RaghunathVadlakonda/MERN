const express = require('express');
const router = express.Router();

// @route           GET api/posts
// @Description     Test route for posts
// @Access          Public route
router.get('/', (req, res) => {
    res.send('Posts route');
});

module.exports = router;