import express, {Application} from "express";
import client from '../../src/db/client.ts';
import request from "supertest";
import {logController} from "../../src/controllers/log-controller.ts";
import logger from '../../src/middleware/logger.ts';

jest.mock('../../src/db/client.ts', () => ({
    execute: jest.fn(),
}));
jest.mock('../../src/middleware/logger.ts', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

describe('Log Controller Tests', () => {
    let app: Application;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.get('/logs', logController);
    });

    it('should return 400 if no query parameters are provided', async () => {
        // Call the controller with no parameters
        const response = await request(app).get('/logs');

        // Assertions
        expect(response.status).toBe(400);
        expect(response.text).toBe('Provide one of these - vehicle ID, error code or dates');
        expect(logger.warn).toHaveBeenCalledWith('No parameters provided for query search');
    });

    it('should call the database with valid query parameters', async () => {
        // Mock the database response
        const mockResult = { rows: [{ vehicle_id: '1013', code: 'U0420', message: 'Error' }] };
        (client.execute as jest.Mock).mockResolvedValue(mockResult);

        // Make a request with vehicleId and code
        const response = await request(app)
            .get('/logs')
            .query({ vehicle: '1013', code: 'U0420' });

        // Assertions
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text)).toEqual(mockResult);
        expect(client.execute).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            expect.arrayContaining(['1013', 'U0420'])
        );
        expect(logger.info).toHaveBeenCalledWith('Fetched results for received query');
    });

    it('should return 500 if the database query fails', async () => {
        // Mock the database query to throw an error
        (client.execute as jest.Mock).mockRejectedValue(new Error('Database error'));

        // Make a request with query parameters
        const response = await request(app)
            .get('/logs')
            .query({ vehicle: '1013' });

        // Assertions
        expect(response.status).toBe(500);
        expect(response.text).toBe('Something went wrong');
    });
})