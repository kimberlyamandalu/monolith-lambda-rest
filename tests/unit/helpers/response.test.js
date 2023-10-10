const {
	buildResponse,
	errorResponse
} = require('../../../services/monolith-rest/src/helpers/response')

const { describe, it, expect } = require('@jest/globals')

describe('Test response', () => {
	describe('Test for buildResponse', () => {
		it('should return a success response with a given status code, body and content type', () => {
			const statusCode = 200
			const body = { message: 'success' }
			const contentType = 'text/plain'

			const expectedResponse = {
				statusCode,
				body: JSON.stringify(body),
				headers: {
					'Content-Type': contentType,
					'Access-Control-Allow-Origin': '*'
				}
			}

			const result = buildResponse(statusCode, body, contentType)
			expect(result).toEqual(expectedResponse)
		})
		it('should return a success response with a given status code and body ', () => {
			const statusCode = 200
			const body = { message: 'success' }

			const expectedResponse = {
				statusCode,
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			}

			const result = buildResponse(statusCode, body)
			expect(result).toEqual(expectedResponse)
		})
	})

	describe('Test for errorResponse', () => {
		it('should return an error response with the given status code and message', () => {
			const err = { statusCode: 400, message: 'error' }
			const expectedResponse = errorResponse(err)

			const result = errorResponse(err)

			expect(result).toEqual(expectedResponse)
		})

		it('should return a 500 error if no status code message is provided', () => {
			const err = { message: 'invalid params' }
			const expectedResponse = buildResponse(500, {
				message: err.message
			})

			const result = errorResponse(err)

			expect(result).toEqual(expectedResponse)
		})
		it('should return a server error if no error message is provided', () => {
			const err = {}
			const expectedResponse = buildResponse(500, {
				message: err.message
			})

			const result = errorResponse(err)

			expect(result).toEqual(expectedResponse)
		})
	})
})
