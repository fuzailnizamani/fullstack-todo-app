const jwt = require('jsonwebtoken');

const accussTokenSecret = process.env.Access_Token_SECRET;

function authenticateAccussToken(req, res, next) {
    // Extract the authorization header
    const authHeader = req.headers['authorization'];
    // The token is usually in the format "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // If no token is provided, return 401 Unauthorized
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    jwt.verify(token, accussTokenSecret, (err, user) => {
        if (err) {
            // If the token is invalid (expired, incorrect signature, etc.), return 403 Forbidden
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        
        // If valid, attach the decoded user payload to the request object
        req.user = user;
        // Pass control to the next middleware function or route handler
        next();
    });
}

module.exports = authenticateAccussToken;