const { docClient } = require('../shared/dynamodb');
const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { jsonResponse, getUserId } = require("../shared/lambda");

require("dotenv").config();

function logDynamoStatus(operation, result) {
    console.log(`DynamoDB ${operation} status:`, result?.$metadata?.httpStatusCode);
}

function logValidationFailure(reason, details = {}) {
    console.warn("Validation failed in getTasks:", { reason, ...details });
}

async function getTasks({ userId }) {
    try {
        if (!userId) {
            logValidationFailure("missing userId");
            return {
                statusCode: 400,
                payload: {
                    message: "userId is required",
                },
            };
        }

        const result = await docClient.send(
            new QueryCommand({
                TableName: process.env.TABLE_NAME,
                IndexName: "userId-index",
                KeyConditionExpression: "userId = :uid",
                ExpressionAttributeValues: {
                    ":uid": userId,
                },
            })
        );
        logDynamoStatus("Query", result);

        return {
            statusCode: 200,
            payload: {
                message: "Tasks retrieved successfully",
                data: result.Items || [],
            },
        };
    } catch (error) {
        console.error("Error retrieving tasks:", error);

        return {
            statusCode: 500,
            payload: {
                message: "Failed to retrieve tasks",
                error: error.message,
            },
        };
    }
}

exports.handler = async (req, res) => {
    const result = await getTasks({
        userId: req.user?.sub,
    });

    return res.status(result.statusCode).json(result.payload);
};

exports.lambdaHandler = async (event) => {
    const result = await getTasks({
        userId: getUserId(event),
    });

    return jsonResponse(result.statusCode, result.payload);
};
