const { CognitoJwtVerifier } = require("aws-jwt-verify");
require("dotenv").config();

const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_CLIENT_ID,
});

async function verifyToken(token) {
    return await verifier.verify(token);
}

module.exports = { verifyToken };