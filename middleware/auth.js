const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function(req, res, next) {

    // GET Token from Header
    const token = req.header('x-auth-token');

    // if token is not available
    if(!token) {
        return res.status(401).json({msg:'No token available, authorization denied!'})
    }
    
    // Token Verify
    try {
        const decoded = jwt.verify(token, config.get('jwtToken'));
        req.user = decoded.user;
        next();
    } catch(err) {
        res.status(401).json({msg:'token is not valid, please check.'})

    }
}