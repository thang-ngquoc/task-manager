const allowedOrigin = process.env.ALLOWED_ORIGIN || "";

function jsonResponse(statusCode, payload) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify(payload),
    };
}

function parseJsonBody(event) {
    if (!event || !event.body) {
        return {};
    }

    try {
        return JSON.parse(event.body);
    } catch (error) {
        return {};
    }
}

function getUserId(event) {
    return event?.requestContext?.authorizer?.claims?.sub;
}

module.exports = {
    jsonResponse,
    parseJsonBody,
    getUserId,
};
