const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route           GET api/auth
// @Description     Test route for auth
// @Access          Public route
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err) {
        console.error(err.message);
        res.send('Server Error');
    }
});

module.exports = router;