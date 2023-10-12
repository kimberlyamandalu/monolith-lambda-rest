const { buildResponse, errorResponse } = require("../helpers/response");
const { scan, getItem, putItem, deleteItem } = require("../helpers/dynamo");
const { randomUUID } = require("crypto");

const TableName = process.env.DYNAMODB_TABLE;

// Lambda handler function
exports.handler = async (event) => {
  /*****************************************************************
    HTTP Methods supported by /items API Path
      - GET /items
      - GET /items/{id}
      - POST /items
      - DELETE /items/{id}
      - PATCH /items/{id}
      - PUT /items/{id}
  *****************************************************************/

  try {
    const { httpMethod, pathParameters } = event;
    
    switch (httpMethod) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          return await getItemById(event);
        } else {
          return await getItems();
        }
      case 'POST':
        return await createItem(event);
      case 'DELETE':
        return await deleteItemById(event);
      case 'PATCH':
        return await updateItemById(event);
      case 'PUT':
        return await updateItemById(event);
      default:
        return errorResponse({ statusCode: 400, message: 'Invalid HTTP method' });
    }
  } catch (error) {
    console.error('Error:', error);
    return errorResponse({ statusCode: 500, message: 'Internal Server Error' });
  }
};

// Helper function to get an item by ID
async function getItemById(event) {
  const id = event.pathParameters.id;

  try {
    const keySchema = {"PK":"id"};

    let Item = {
      [keySchema.PK]: id
    };

    const ddbRes = await getItem(TableName, Item);

    if (!ddbRes.Item)
      throw {
        statusCode: 400,
        message: "Item not found"
      };

    return buildResponse(200, ddbRes.Item);
  } catch (error) {
    return errorResponse(error);
  }
}

// Helper function to get all items
async function getItems() {
  try {
    const scanInput = {
      TableName: TableName
    };

    const ddbRes = await scan(scanInput);
    return buildResponse(200, ddbRes.Items);
  } catch (error) {
    return errorResponse(error);
  }
}

// Helper function to create a new item
async function createItem(event) {
  try {
    let cognitoUserId;
    if (event.requestContext.authorizer)
      cognitoUserId = event?.requestContext?.authorizer?.claims?.sub;
    
    const item = JSON.parse(event.body);
    const id = randomUUID();
    const now = new Date().toISOString();

    const keySchema = {"PK":"id"};

    let Item = {
      [keySchema.PK]: id,
      ...item,
      createdAt: now,
      updatedAt: now
    };

    if (cognitoUserId)
      Item.cognitoUserId = cognitoUserId;

    await putItem(TableName, Item);
    return buildResponse(201, Item);
  } catch (error) {
    return errorResponse(error);
  }
}

// Helper function to delete an item by ID
async function deleteItemById(event) {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      throw { statusCode: 400, message: "invalid param" };
    }

    const keySchema = {"PK":"id"};

    let Item = {
      [keySchema.PK]: id
    };

    await deleteItem(TableName, Item);
    return buildResponse(200, { message: "success" });
  } catch (error) {
    return errorResponse(error);
  }
}

// Helper function to update an item by ID
async function updateItemById(event) {
  try {
    let cognitoUserId;
    if (event.requestContext.authorizer)
      cognitoUserId = event?.requestContext?.authorizer?.claims?.sub;

    const id = event.pathParameters?.id;

    if (!id)
      throw { statusCode: 400, message: "invalid param" };

    const now = new Date().toISOString();
    const keySchema = {"PK":"id"};
    const item = JSON.parse(event.body);

    let Item = {
        [keySchema.PK]: id,
        ...item,
        updatedAt: now
    };

    if (cognitoUserId)
      Item.cognitoUserId = cognitoUserId;

    await putItem(TableName, Item);
    return buildResponse(200, { message: "success" });
  } catch (error) {
    return errorResponse(error);
  }
}
