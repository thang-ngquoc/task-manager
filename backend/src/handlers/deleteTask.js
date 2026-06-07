const { docClient } = require("../shared/dynamodb");
const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { jsonResponse, getUserId } = require("../shared/lambda");

require("dotenv").config();

function logDynamoStatus(operation, result) {
    console.log(`DynamoDB ${operation} status:`, result?.$metadata?.httpStatusCode);
}

function logValidationFailure(reason, details = {}) {
    console.warn("Validation failed in deleteTask:", { reason, ...details });
}

async function deleteTask({ userId, taskId }) {
    try {
        if (!userId) {
            logValidationFailure("missing userId", { taskId });
            return {
                statusCode: 400,
                payload: {
                    message: "userId is required",
                },
            };
        }

        if (!taskId) {
            logValidationFailure("missing taskId", { userId });
            return {
                statusCode: 400,
                payload: {
                    message: "Task ID is required",
                },
            };
        }

        const result = await docClient.send(
            new DeleteCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    taskId: taskId,
                },
                ExpressionAttributeValues: {
                    ":uid": userId,
                },
                ConditionExpression: "userId = :uid",
            })
        );
        logDynamoStatus("DeleteItem", result);

        return {
            statusCode: 200,
            payload: {
                message: "Task deleted successfully",
            },
        };
    } catch (error) {
        console.log("Error deleting task:", error);

        if (error.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 403,
                payload: {
                    message: "You do not have permission to delete this task",
                },
            };
        }

        return {
            statusCode: 500,
            payload: {
                message: "Error deleting task",
                error: error.message,
            },
        };
    }
}

exports.handler = async (req, res) => {
    const result = await deleteTask({
        userId: req.user?.sub,
        taskId: req.params.id,
    });

    return res.status(result.statusCode).json(result.payload);
};

exports.lambdaHandler = async (event) => {
    const result = await deleteTask({
        userId: getUserId(event),
        taskId: event?.pathParameters?.id,
    });

    return jsonResponse(result.statusCode, result.payload);
};
