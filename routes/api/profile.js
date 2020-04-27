const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

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




// @route           POST api/profile
// @Description     Creating the user profile
// @Access          Private route
router.post('/', [auth, [
    
    // checking the validations for status and skills using express-validator module.
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()
]], 

     async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {

            company,
            webiste,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;


        // Build Profile object.
        const profileFields = {}

        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(webiste) profileFields.webiste = webiste;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build Social object
        profileFields.social = {}
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(facebook) profileFields.social.facebook = facebook;
        if(instagram) profileFields.social.instagram = instagram;

        // console.log(profileFields.skills);


        try {

            let profile = await Profile.findOne({ user: req.user.id});

            // If profile found with user id then we are updating profileFields.
            if(profile) {
                profile = await Profile.findOneAndUpdate({user: req.user.id},
                     {$set: profileFields}, {new: true }
                    );

                    return res.json(profile);
            }

            // Here we are creating profile 
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }



        // res.send('Profile');
});




module.exports = router;