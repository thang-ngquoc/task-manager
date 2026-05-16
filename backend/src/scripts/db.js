const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");

require("dotenv").config();

const client = require('../shared/dynamodb').client;

async function createTable() {
    const command = new CreateTableCommand({
        TableName: process.env.TABLE_NAME,

        AttributeDefinitions: [
            {
                AttributeName: "taskId",
                AttributeType: "S"
            },
            {
                AttributeName: "userId",
                AttributeType: "S"
            }
        ],

        KeySchema: [
            {
                AttributeName: "taskId",
                KeyType: "HASH"
            }
        ],

        BillingMode: "PAY_PER_REQUEST",

        GlobalSecondaryIndexes: [
            {
                IndexName: "userId-index",

                KeySchema: [
                    {
                        AttributeName: "userId",
                        KeyType: "HASH"
                    }
                ],

                Projection: {
                    ProjectionType: "ALL"
                }
            }
        ]
    });

    await client.send(command);

    console.log("Table created");
}

createTable();