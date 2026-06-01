const { verifyToken } = require('../shared/auth');

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Missing token",
            });
        }

        const token = authHeader.split(" ")[1];
        const payload = await verifyToken(token);
        
        req.user = payload;
        
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized",
            error: error.message,
        })
    }
}

module.exports = authMiddleware;