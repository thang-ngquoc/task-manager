const { docClient } = require("../shared/dynamodb");
const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");

require("dotenv").config();

exports.handler = async(req, res) => {
    try {
        const taskId = req.params.id;

        if (!taskId) {
            return res.status(400).json({
                message: "Task ID is required",
            });
        }

        await docClient.send(
            new DeleteCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    taskId: taskId,
                },
            })
        );

        return res.status(200).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.log("Error deleting task:", error);

        res.status(500).json({
            message: "Error deleting task",
            error: error.message,
        });
    }
}