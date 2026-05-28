const { docClient } = require('../shared/dynamodb');
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

require("dotenv").config();

exports.handler = async (req, res) => {
    try {
        const result = await docClient.send(
            new ScanCommand({
                TableName: process.env.TABLE_NAME,
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