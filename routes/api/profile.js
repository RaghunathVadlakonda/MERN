const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

// @route           GET api/profile/me
// @Description     Get the Users profile based on the users id
// @Access          Private route
router.get('/me', auth, async(req, res) => {

    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name','avatar'])
        
        // If condition for checking the no profile.
        if(!profile) {
            res.status(400).json({msg: 'There is no profile with this details.'});
        }

        res.json(profile);
        res.send('Successfully got profile.');
    }catch(err) {
        console.error(err.message);
        res.send('Server Error');
    }
    // res.send('Profile route');
});

module.exports = router;