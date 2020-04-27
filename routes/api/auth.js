const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

// @route           GET api/auth
// @Description     Test route for auth
// @Access          Private route
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err) {
        console.error(err.message);
        res.send('Server Error');
    }
});


// @route           POST api/auth
// @Description     Login Users
// @Access          Public route
router.post('/',
[
    // Backend Validations using express-validator module..
    check('email', 'Please specify a valid email').isEmail(),
    check('password', 'password not specified').exists()
], 
async (req, res) => {
   const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }

    const {email, password} = req.body; 


    try {
    // Checking user with email.
    let user = await User.findOne({email});

    if(!user) {
        return res.status(400).json({errors: [{msg:'Invalid Credentials'}]});
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        return res.status(400).json({errors: [{msg:'Invalid Credentials'}]});
    }



    // JWT --> Header,Payload,Verify Signature this 3 combind in JWT Token.

    const payload = {
        user: {
            id:user.id    
        }
    }

    jwt.sign(
        payload,
        config.get('jwtToken'),
        {expiresIn: 36000},
        (err, token) => {
            if(err) throw err;
            res.json({ token})
        }
    );
    // res.send('User Registered');
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;