// const { putItem } = require('items-rest-api/src/helpers/dynamo')
const { 
  putItem,
  getItem,
  deleteItem,
  scan
} = require('../../../services/monolith-rest/src/helpers/dynamo')
const {
	buildResponse,
	errorResponse
} = require('../../../services/monolith-rest/src/helpers/response')

const { handler } = require('../../../services/monolith-rest/src/handlers/monolith-items-lambda')

const { describe, it, expect } = require('@jest/globals')

jest.mock('../../../services/monolith-rest/src/helpers/dynamo')
jest.mock('../../../services/monolith-rest/src/helpers/response')

const TableName = process.env.TableName
const keySchema = {"PK":"id"}

describe('Test getItemById function success', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 200 response when item is found', async () => {
    const eventJSON = require('../../../events/getItemById.json')
    const id = eventJSON.pathParameters.id
		const cognitoUserId = eventJSON.requestContext.authorizer.claims.sub

		const Item = {
			[keySchema.PK]: id
		}
		const expectedItem = expect.objectContaining({
			[keySchema.PK]: id,
			cognitoUserId,
			productName: expect.any(String),
			productPrice: expect.any(String),
			createdAt: expect.any(String),
			updatedAt: expect.any(String)
		})

		const expectedResponse = buildResponse(200, expectedItem)

		getItem.mockResolvedValue({ Item: expectedItem })
		buildResponse.mockReturnValue(expectedResponse)

		const result = await handler(eventJSON)

		expect(getItem).toHaveBeenCalledTimes(1)
		expect(getItem).toHaveBeenCalledWith(TableName, Item)
		expect(result).toEqual(expectedResponse)
		expect(buildResponse).toHaveBeenCalledWith(200, expectedItem)
  })
})

describe('Test getItemById handler Item not found', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})
	it('should return a 400 error response if item is not found', async () => {
    const eventJSON = require('../../../events/getItemById.json')
		const id = eventJSON.pathParameters.id
		const expectedError = { statusCode: 400, message: 'Item not found' }

		getItem.mockResolvedValue({})
		errorResponse.mockReturnValue(expectedError)

		const result = await handler(eventJSON)

		expect(getItem).toHaveBeenCalledTimes(1)
		expect(getItem).toHaveBeenCalledWith(TableName, { [keySchema.PK]: id })
		expect(result).toEqual(expectedError)
		expect(errorResponse).toHaveBeenCalledWith(expectedError)
	})
})

describe('Test createItem function success', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 201 response when an item is created', async () => {
    const eventJSON = require('../../../events/createItem.json')
    const item = JSON.parse(eventJSON.body)
		const cognitoUserId = eventJSON.requestContext.authorizer.claims.sub

		const expectedItem = expect.objectContaining({
			...item,
			[keySchema.PK]: expect.any(String),
			cognitoUserId,
			updatedAt: expect.any(String),
			createdAt: expect.any(String)
		})

		const expectedResponse = buildResponse(201, expectedItem)

		putItem.mockResolvedValueOnce({})
		buildResponse.mockReturnValue(expectedResponse)

		const result = await handler(eventJSON)

		expect(putItem).toHaveBeenCalledTimes(1)
		expect(putItem).toHaveBeenCalledWith(TableName, expectedItem)
		expect(result).toEqual(expectedResponse)
		expect(buildResponse).toHaveBeenCalledWith(201, expectedItem)
  })
})

describe('Test createItem function error', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 500 response when an error occurs', async () => {
    const errorJSON = {
			body: JSON.stringify({}),
			requestContext: {},
      httpMethod: 'POST'
		}
		const error = new Error('server error')
		error.statusCode = 500

		errorResponse.mockReturnValue({
			statusCode: error.statusCode,
			message: error.message
		})

		putItem.mockRejectedValueOnce(error)
		const result = await handler(errorJSON)

		expect(putItem).toHaveBeenCalledTimes(1)
		expect(errorResponse).toHaveBeenCalledWith(error)
		expect(result).toEqual(errorResponse(error))
  })
})

describe('Test updateItemById handler success', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it.each([
    ['PUT'],
    ['PATCH']
  ])
  ('should return a 200 success response if an item is updated', async (httpMethod) => {
    const eventJSON = require('../../../events/updateItemById.json')
    const body = JSON.parse(eventJSON.body)
		const cognitoUserId = eventJSON.requestContext.authorizer.claims.sub
    eventJSON.httpMethod = httpMethod

		const expectedItem = expect.objectContaining({
			...body,
			[keySchema.PK]: eventJSON.pathParameters?.id,
			cognitoUserId,
			updatedAt: expect.any(String)
		})

		const expectedResponse = buildResponse(200, expectedItem)
		putItem.mockResolvedValueOnce({})
		buildResponse.mockReturnValue(expectedResponse)

		const result = await handler(eventJSON)
		
		expect(result).toEqual(expectedResponse)
		expect(buildResponse).toHaveBeenCalledWith(200, expectedItem)
  })
})

describe('Test updateItemById handler invalid param', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})
  it.each([
    ['PUT'],
    ['PATCH']
  ])
	('should return a 400 response when id is not provided', async (httpMethod) => {
    const eventJSON = require('../../../events/updateItemById.json')
		const errorJSON = JSON.parse(JSON.stringify(eventJSON))
		errorJSON.pathParameters = {}
    eventJSON.httpMethod = httpMethod

		const expectedError = { statusCode: 400, message: 'invalid param' }

		putItem.mockRejectedValue(expectedError)
		errorResponse.mockReturnValue(expectedError)

		const result = await handler(errorJSON)

		expect(result).toEqual(expectedError)
		expect(errorResponse).toHaveBeenCalledWith(expectedError)
	})
})
describe('Test updateItemById handler server error', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})
  it.each([
    ['PUT'],
    ['PATCH']
  ])
	('should return a 500 response when an error occurs', async (httpMethod) => {
    const eventJSON = require('../../../events/updateItemById.json')
		const expectedError = { statusCode: 500, message: 'server error' }
    eventJSON.httpMethod = httpMethod

		putItem.mockRejectedValue(expectedError)
		errorResponse.mockReturnValue(expectedError)

		const result = await handler(eventJSON)

		expect(result).toEqual(expectedError)
		expect(errorResponse).toHaveBeenCalledWith(expectedError)
	})
})

describe('Test deleteItemById handler success', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 204 success response if item is deleted', async () => {
    const eventJSON = require('../../../events/deleteItemById.json')
		const id = eventJSON.pathParameters.id

		const Item = {
			[keySchema.PK]: id
		}

		const expectedResponse = buildResponse(204, { message: 'success' })

		deleteItem.mockResolvedValue({ Item: { message: 'success' } })
		buildResponse.mockReturnValue(expectedResponse)

		const result = await handler(eventJSON)

		expect(deleteItem).toHaveBeenCalledTimes(1)
		expect(result).toEqual(expectedResponse)
		expect(deleteItem).toHaveBeenCalledWith(TableName, Item)
		expect(buildResponse).toHaveBeenCalledWith(204, { message: 'success' })
	})
})

describe('Test deleteItemById handler invalid param', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 400 error response if id is not provided', async () => {
    const eventJSON = require('../../../events/deleteItemById.json')
		const errorJSON = JSON.parse(JSON.stringify(eventJSON))
		errorJSON.pathParameters = {}
		const expectedError = { statusCode: 400, message: 'invalid param' }

		errorResponse.mockReturnValue(expectedError)

		const result = await handler(errorJSON)
		expect(result).toEqual(expectedError)
		expect(errorResponse).toHaveBeenCalledWith(expectedError)
	})
})

describe('Test deleteItemById handler Item not found', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})
	it('should return a 400 error response if item is not found', async () => {
    const eventJSON = require('../../../events/deleteItemById.json')
		const id = eventJSON.pathParameters.id
		const expectedError = { statusCode: 400, message: 'Item not found' }

		deleteItem.mockRejectedValue(expectedError)
		errorResponse.mockReturnValue(expectedError)

		const result = await handler(eventJSON)

		expect(deleteItem).toHaveBeenCalledTimes(1)
		expect(result).toEqual(expectedError)
		expect(deleteItem).toHaveBeenCalledWith(TableName, {
			[keySchema.PK]: id
		})
		expect(errorResponse).toHaveBeenCalledWith(expectedError)
	})
})

describe('Test deleteItemById handler server error', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 500 error response if the server is down', async () => {
    const eventJSON = require('../../../events/deleteItemById.json')
		const id = eventJSON.pathParameters.id
		const expectedError = { statusCode: 500, message: 'server error' }

		deleteItem.mockRejectedValueOnce(expectedError)
		errorResponse.mockReturnValue(expectedError)

		const result = await handler(eventJSON)

		expect(deleteItem).toHaveBeenCalledTimes(1)
		expect(result).toEqual(expectedError)
		expect(deleteItem).toHaveBeenCalledWith(TableName, {
			[keySchema.PK]: id
		})
		expect(errorResponse).toHaveBeenCalledWith(expectedError)
	})
})

describe('Test scanItems handler success', () => {
  beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 200 success response with list of items', async () => {
    const eventJSON = require('../../../events/getItems.json')
    const itemsList = [
      {
        item: "watch",
        owner: "user1",
        price: 100
      },
      {
        item: "jacket",
        owner: "user2",
        color: "black"
      }
    ]
		const expectedResponse = buildResponse(200, itemsList)

		scan.mockResolvedValueOnce(itemsList)
		buildResponse.mockReturnValue(expectedResponse)
    
		const result = await handler(eventJSON)

		expect(scan).toHaveBeenCalledTimes(1)
		expect(result).toEqual(expectedResponse)
		expect(scan).toHaveBeenCalledWith({ TableName: undefined })
		expect(buildResponse).toHaveBeenCalledWith(200, itemsList)
	})
})

describe('Test scanItems function server error', () => {
  beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a 500 error response with server error message', async () => {
    const eventJSON = require('../../../events/getItems.json')
    const expectedError = { statusCode: 500, message: 'server error' }

		scan.mockRejectedValueOnce(expectedError)
    
		const result = await handler(eventJSON)

		expect(scan).toHaveBeenCalledTimes(1)
    expect(scan).toHaveBeenCalledWith({ TableName: undefined })
		expect(result).toEqual(expectedError)
	})
})

describe('test unsupported HTTP Method', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['OPTIONS'],
    ['HEAD']
  ])
  ('Unsupported HTTP Method returns error code 400 Invalid HTTP Method', async (unsupportedHttpMethod) => {
    const eventJSON = {
      httpMethod: unsupportedHttpMethod
    }
    const expectedError = {
      statusCode: 400,
      message: 'Invalid HTTP Method'
    
    }
    errorResponse.mockReturnValue(expectedError)

    const result = await handler(eventJSON)
    expect(errorResponse).toHaveBeenCalledWith(expectedError)
    expect(result).toEqual(expectedError)
  })
})