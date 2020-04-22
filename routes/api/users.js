const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

// @route           POST api/users
// @Description     Register Users
// @Access          Public route
router.post('/',
[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please specify a valid email').isEmail(),
    check('password', 'password should be not less than 6 characters').isLength({min:6})
], 
(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }
    console.log(req.body);
    res.send('Users route');
});

module.exports = router;