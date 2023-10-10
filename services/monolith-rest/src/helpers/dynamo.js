// no need to include aws-sdk into package.json it's already part of lambda environment

const {
    DynamoDBClient,
    CreateTableCommand,
    DeleteTableCommand,
    DescribeTableCommand,
    waitUntilTableNotExists
} = require("@aws-sdk/client-dynamodb");

const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    ScanCommand,
    QueryCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/createtablecommand.html
const createTable = async (params) => {
    const {
        TableName,
        KeySchema,
        AttributeDefinitions,
        ProvisionedThroughput
    } = params;
    return await ddbDocClient.send(
        new CreateTableCommand({
            TableName,
            KeySchema,
            AttributeDefinitions,
            ProvisionedThroughput
        })
    );
};

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/deletetablecommand.html
const deleteTable = async (TableName) =>
    await ddbDocClient.send(new DeleteTableCommand({ TableName }));

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/classes/_aws_sdk_lib_dynamodb.PutCommand.html
const putItem = async (TableName, Item) =>
    await ddbDocClient.send(new PutCommand({ TableName, Item }));

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/classes/_aws_sdk_lib_dynamodb.GetCommand.html
const getItem = async (TableName, Key) =>
    await ddbDocClient.send(new GetCommand({ TableName, Key }));

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/classes/_aws_sdk_lib_dynamodb.QueryCommand.html
const queryItemByIndex = async (query) =>
    await ddbDocClient.send(new QueryCommand(query));

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/classes/_aws_sdk_lib_dynamodb.ScanCommand.html
const scan = async (query) => ddbDocClient.send(new ScanCommand(query));

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/classes/_aws_sdk_lib_dynamodb.DeleteCommand.html
const deleteItem = async (TableName, Key) =>
    await ddbDocClient.send(new DeleteCommand({ TableName, Key }));

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/functions/waituntiltablenotexists.html
const waitUntil = async ({ TableName }) => {
    await waitUntilTableNotExists({ ddbDocClient }, TableName);
};

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/describetablecommand.html
const describeTable = async (TableName) =>
    await ddbDocClient.send(new DescribeTableCommand({ TableName }));

module.exports = {
    ddbDocClient,
    createTable,
    deleteTable,
    describeTable,
    waitUntil,
    putItem,
    getItem,
    scan,
    queryItemByIndex,
    deleteItem
};
