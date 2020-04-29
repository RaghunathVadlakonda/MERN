const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const request = require('request');
const config = require('config');


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
});



// @route           GET api/profile
// @Description     Get the All Users profiles
// @Access          Public route
router.get('/', async(req, res) => {

    try {
        const profiles = await Profile.find().populate('user', ['name','avatar'])
        
        // If condition for checking the no profile.
        if(!profiles) {
            return res.status(400).json({msg: 'There is no profiles in the database.'});
        }

        res.json(profiles);
        res.send('Successfully got profiles.');
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route           GET api/profile/user/:user_id
// @Description     Get the User profile based on user id
// @Access          Public route
router.get('/user/:user_id', async(req, res) => {

    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name','avatar'])
        
        // If condition for checking the no profile.
        if(!profile) 
            return res.status(400).json({msg: 'There is no profile with this details.'});
        

        res.json(profile);
        // res.send('Successfully got profile.');
    }catch(err) {
        console.error(err.message);
        if(err.name == 'CastError') {
            return res.status(400).json({msg: 'There is no profile with this details.'});
        }
        res.status(500).send('Server Error');
    }
});




// @route           POST api/profile
// @Description     Delete the User and Profile and Posts
// @Access          Private route
router.delete('/',auth, async(req, res) => {

    try {

        // Remove users posts


        // Remove profile
        await Profile.findOneAndRemove({user: req.user.id})

        // Remove user
        await User.findOneAndRemove({_id: req.user.id})
    
        res.json({msg: "Successfully Deleted"});
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route           PUT api/profile/experience
// @Description     Updating the profile experiences.
// @Access          Private route

router.put('/experience', [auth, [

    // checking the validations.
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'from Date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        title,
        company,
        from,
        to,
        current,
        location,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        from,
        to,
        current,
        location,
        description
    }

    try {

        const profile = await Profile.findOne({user: req.user.id})

        if(!profile) {
            return res.status(400).json({msg: 'Profile Not Found'})
        }

        profile.experience.unshift(newExp);
        // console.log('check in put'+ profile.experience);
        await profile.save();
        res.json(profile);
     
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
        
    }
    
});
    


// @route           DELETE api/profile/experience/:exp_id
// @Description     Deleting the selected experience from user profile.
// @Access          Private route

router.delete('/experience/:exp_id', auth, async(req, res) => {

    try {

        // GET profile with user id
        const profile = await Profile.findOne({user: req.user.id});

        // we are mapping for select correct experience from list
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        // remove experience
        profile.experience.splice(removeIndex, 1);

        // saving and sending profile response after deleting the experience
        await profile.save();
        res.json(profile);

        

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }

});





// @route           PUT api/profile/education
// @Description     Updating the profile education.
// @Access          Private route

router.put('/education', [auth, [

    // checking the validations.
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'from Date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        school,
        degree,
        from,
        to,
        current,
        feildofstudy,
        description
    } = req.body;

    const newExp = {
        school,
        degree,
        from,
        to,
        current,
        feildofstudy,
        description
    }

    try {

        const profile = await Profile.findOne({user: req.user.id})

        if(!profile) {
            return res.status(400).json({msg: 'Profile Not Found'})
        }

        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
     
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
        
    }
    
});
    


// @route           DELETE api/profile/education/:edu_id
// @Description     Deleting the selected education from user profile.
// @Access          Private route

router.delete('/education/:edu_id', auth, async(req, res) => {

    try {
        // GET profile with user id
        const profile = await Profile.findOne({user: req.user.id});

        // we are mapping for select correct experience from list
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id);

        // remove experience
        profile.education.splice(removeIndex, 1);

        // saving and sending profile response after deleting the experience
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }

});


// @route           GET api/profile/github/:username
// @Description     Getting the github repos based on the username.
// @Access          Public route

router.get('/github/:username', (req, res) => {

    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username}/repos?per_page=5&sort=created:ASC&
                client_id=${config.get('githubClientId')}&
                client_secret=${config.get('githubClientSecret')}`,
                method: 'GET',
                headers: {'user-agent':'node.js'}
        }

        request(options, (error, response, body) => {

            // checking the Error.
            if(error) {
                console.error(error);
            }

            // checking the error in response.
            if(response.statusCode !== 200) {
                return res.status(404).json({msg: 'No github profile found.'})
            }

            // if everything fine then we will get data-body basically body is a string 
            //     so, we are converting string into json format using JSON.parse
            res.json(JSON.parse(body));

        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }

});




module.exports = router;