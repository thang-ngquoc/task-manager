const { docClient } = require('../shared/dynamodb');
const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

require("dotenv").config();

exports.handler = async (req, res) => {
    try {
        const userId = req.user.sub;

        if (!userId) {
            return res.status(400).json({
                message: "userId is required",
            });
        }
        
        const result = await docClient.send(
            new QueryCommand({
                TableName: process.env.TABLE_NAME,
                IndexName: 'userId-index',
                KeyConditionExpression: 'userId = :uid',
                ExpressionAttributeValues: {
                    ':uid': userId,
                },
            })
        )

        res.status(200).json({
            message: 'Tasks retrieved successfully',
            data: result.Items || [],
        })
    } catch (error) {
        console.error("Error retrieving tasks:", error);
        
        res.status(500).json({
            message: "Failed to retrieve tasks",
            error: error.message,
        });
    }
};