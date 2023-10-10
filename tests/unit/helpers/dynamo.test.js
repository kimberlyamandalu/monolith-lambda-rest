const {
	PutCommand,
	GetCommand,
	DeleteCommand,
	ScanCommand,
	QueryCommand
} = require('@aws-sdk/lib-dynamodb')
const {
	ddbDocClient,
	createTable,
	deleteTable,
	describeTable,
	putItem,
	getItem,
	scan,
	queryItemByIndex,
	deleteItem
} = require('../../../services/monolith-rest/src/helpers/dynamo')
const {
	CreateTableCommand,
	DeleteTableCommand,
	DescribeTableCommand
} = require('@aws-sdk/client-dynamodb')

const { describe, it, expect } = require('@jest/globals')

const { mockClient } = require('aws-sdk-client-mock')

const ddbMock = mockClient(ddbDocClient) // Wrap the DynamoDB DocumentClient with the mockClient
describe('createTable', () => {
	beforeEach(() => {
		ddbMock.reset()
	})

	it('should create a table and return the response', async () => {
		const mockParams = {
			TableName: 'MockTable',
			KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
			AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
			ProvisionedThroughput: {
				ReadCapacityUnits: 5,
				WriteCapacityUnits: 5
			}
		}

		const expectedResponse = {
			TableDescription: {
				TableName: 'MockTable',
				TableStatus: 'ACTIVE'
				// Include other properties as per your response structure
			}
		}

		ddbMock.on(CreateTableCommand).resolves(expectedResponse) // Mock the response for the CreateTableCommand

		const response = await createTable(mockParams)

		expect(ddbMock.calls(CreateTableCommand)).toHaveLength(1)
		expect(ddbMock.calls(CreateTableCommand)[0].args[0].input).toEqual(
			mockParams
		)
		expect(response).toEqual(expectedResponse) // Verify that the response matches the expected response
	})
})

describe('Test deleteTable', () => {
	beforeEach(() => {
		ddbMock.reset() // Reset the ddbMock after each test
	})

	it('should delete a table and return the response', async () => {
		const TableName = 'MockTable'

		const expectedResponse = {
			TableDescription: {
				TableName: 'MockTable',
				TableStatus: 'DELETING'
			}
		}

		ddbMock.on(DeleteTableCommand).resolves(expectedResponse) 

		const response = await deleteTable(TableName)

		expect(ddbMock.calls(DeleteTableCommand)).toHaveLength(1)
		expect(ddbMock.calls(DeleteTableCommand)[0].args[0].input).toEqual({
			TableName
		})
		expect(response).toEqual(expectedResponse) 
	})
})

describe('Test describeTable', () => {
	beforeEach(() => {
		ddbMock.reset()
	})

	it('should describe a table and return the response', async () => {
		const TableName = 'MockTable'

		const expectedResponse = {
			TableDescription: {
				TableName: 'MockTable',
				TableStatus: 'ACTIVE',
				AttributeDefinitions: [
					{
						// AttributeDefinition
						AttributeName: 'id',
						AttributeType: 'S'
					}
				],
				KeySchema: [
					{
						AttributeName: 'id',
						KeyType: 'HASH'
					}
				]
			}
		}

		ddbMock.on(DescribeTableCommand).resolves(expectedResponse) // Mock the response for the DescribeTableCommand

		const response = await describeTable(TableName)

		expect(ddbMock.calls(DescribeTableCommand)).toHaveLength(1)

		expect(ddbMock.calls(DescribeTableCommand)[0].args[0].input).toEqual({
			TableName
		})

		expect(response).toEqual(expectedResponse) // Verify that the response matches the expected response
	})
})

describe('Test putItem', () => {
	beforeEach(() => {
		ddbMock.reset()
	})
	it('should put an item in a table', async () => {
		const TableName = 'MockTable'
		const Item = {
			id: '1234',
			name: 'test'
		}

		await putItem(TableName, Item)

		ddbMock.on(PutCommand).resolves({})

		expect(ddbMock.calls(PutCommand)).toHaveLength(1)
		expect(ddbMock.calls(PutCommand)[0].args[0].input).toEqual({
			TableName,
			Item
		})
	})

	it('should handle errors', async () => {
		const TableName = 'MockTable'
		const Item = {
			id: '1234',
			name: 'test'
		}
		const errorMessage = 'An error occurred'

		ddbMock.on(PutCommand).rejects(new Error(errorMessage))

		await expect(putItem(TableName, Item)).rejects.toThrow(errorMessage)
	})
})

describe('Test getItem', () => {
	// before each, reset the ddbMock
	beforeEach(() => {
		ddbMock.reset()
	})
	it('should get an item from a table', async () => {
		const TableName = 'MockTable'
		const Key = {
			id: '1234'
		}

		const expectedResponse = {
			Item: {
				id: '1234',
				name: 'test'
			}
		}

		await getItem(TableName, Key)

		ddbMock.on(GetCommand).resolves(expectedResponse)
		expect(ddbMock.calls(GetCommand)).toHaveLength(1)
		expect(ddbMock.calls(GetCommand)[0].args[0].input).toEqual({
			TableName,
			Key: Key
		})

	})

	it('should handle errors', async () => {
		const TableName = 'MockTable'
		const Key = { id: '1' }
		const errorMessage = 'An error occurred'

		ddbMock.on(GetCommand).rejects(new Error(errorMessage))

		await expect(getItem(TableName, Key)).rejects.toThrow(errorMessage)
	})

	it('should return an empty object if item not found', async () => {
		const TableName = 'MockTable'
		const Key = { id: '1' }

		ddbMock.on(GetCommand).resolves({})

		const response = await getItem(TableName, Key)
		expect(ddbMock.calls(GetCommand)).toHaveLength(1)
		expect(ddbMock.calls(GetCommand)[0].args[0].input).toEqual({
			TableName,
			Key: Key
		})
		expect(response).toEqual({})
	})
})

describe('Test queryItemByIndex', () => {
	beforeEach(() => {
		ddbMock.reset()
	})
	it('should query items with given params', async () => {
		const query = {
			TableName: 'MockTable',
			KeyConditionExpression: 'id = :id',
			ExpressionAttributeValues: { id: '1234' }
		}

		const expectedItems = [
			{ id: '1234', name: 'test1' },
			{ id: '1234', name: 'test2' }
		]
		ddbMock.on(QueryCommand).resolves(expectedItems)

		const response = await queryItemByIndex(query)

		expect(ddbMock.calls(QueryCommand)).toHaveLength(1)
		expect(ddbMock.calls(QueryCommand)[0].args[0].input).toEqual(query)
		expect(response).toEqual(expectedItems)
	})

	it('should handle errors and reject with the error', async () => {
		const query = {
			TableName: 'MockTable',
			KeyConditionExpression: 'id = :id',
			ExpressionAttributeValues: { id: '1234' }
		}
		const errorMessage = 'An error occurred'

		ddbMock.on(QueryCommand).rejects(new Error(errorMessage))

		await expect(queryItemByIndex(query)).rejects.toThrow(errorMessage)
	})
})

describe('Test scan', () => {
	beforeEach(() => {
		ddbMock.reset()
	})

	it('should scan table with given params', async () => {
		const query = {
			TableName: 'MockTable'
		}
		const expectedItems = [
			{ id: '1234', name: 'test1' },
			{ id: '1234', name: 'test2' }
		]
		ddbMock.on(ScanCommand).resolves(expectedItems)

		const response = await scan(query)

		expect(ddbMock.calls(ScanCommand)).toHaveLength(1)
		expect(ddbMock.calls(ScanCommand)[0].args[0].input).toEqual(query)
		expect(response).toEqual(expectedItems)
	})

	it('should handle errors and reject with the error', async () => {
		const query = {
			TableName: 'MockTable'
		}
		const errorMessage = 'An error occurred'

		ddbMock.on(ScanCommand).rejects(new Error(errorMessage))

		await expect(scan(query)).rejects.toThrow(errorMessage)
	})
})

describe('Test deleteItem', () => {
	beforeEach(() => {
		ddbMock.reset()
	})
	it('should delete an item from a table', async () => {
		const TableName = 'MockTable'
		const Key = { id: '1234' }

		const expectedResponse = {}

		ddbMock.on(DeleteCommand).resolves(expectedResponse)

		const response = await deleteItem(TableName, Key)

		expect(ddbMock.calls(DeleteCommand)).toHaveLength(1)
		expect(ddbMock.calls(DeleteCommand)[0].args[0].input).toEqual({
			TableName,
			Key
		})
		expect(response).toEqual(expectedResponse) 
	})
})
