const { buildResponse, errorResponse } = require("../helpers/response");
const TableName = process.env.DYNAMODB_TABLE;

const handler = async (event) => {
    try {
        return buildResponse(200, { message: "Hello World!" });
    } catch (error) {
        return errorResponse(error);
    }
};

module.exports = { handler };
