const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');

// @route           POST api/users
// @Description     Register Users
// @Access          Public route
router.post('/',
[
    // Backend Validations using express-validator module..
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please specify a valid email').isEmail(),
    check('password', 'password should be not less than 6 characters').isLength({min:6})
], 
async (req, res) => {
   const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }

    const {name, email, password} = req.body; 


    try {
    // Handling User already exists...
    let user = await User.findOne({email});

    if(user) {
        res.status(400).json({errors: [{msg:'User alredy exists'}]});
    }
    // 
    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    user = new User({
        name,
        email,
        avatar,
        password
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();
    // console.log(req.body);
    res.send('User Registered');
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;