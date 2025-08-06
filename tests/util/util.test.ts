import { validateLogDataFormat } from '../../src/util/util.ts'; // Adjust the import path

describe('Log Data validator tests', () => {

    it('should return true for valid log data', () => {
        const validLogData : VehicleLogData = {
            timestamp: '2025-08-06T12:00:00Z',
            vehicleId: '12345',
            logLevel: 'INFO',
            code: 'CODE123',
            message: 'This is a log message',
        };

        const result = validateLogDataFormat(validLogData);
        expect(result).toBe(true);
    });

    it('should return false if timestamp is not a string', () => {
        const invalidLogData = {
            timestamp: 12345,
            vehicleId: "12345",
            logLevel: 'INFO',
            code: 'CODE123',
            message: 'This is a log message',
        };

        const result = validateLogDataFormat(invalidLogData);
        expect(result).toBe(false);
    });

    // it('should return false if vehicleId is not a number', () => {
    //     const invalidLogData = {
    //         timestamp: '2025-08-06T12:00:00Z',
    //         vehicleId: 'not_a_number', // Invalid: should be a number
    //         logLevel: 'INFO',
    //         code: 'CODE123',
    //         message: 'This is a log message',
    //     };
    //
    //     const result = validateLogDataFormat(invalidLogData);
    //     expect(result).toBe(false);
    // });

    it('should return false if logLevel is not a string', () => {
        const invalidLogData = {
            timestamp: '2025-08-06T12:00:00Z',
            vehicleId: 12345,
            logLevel: 123,
            code: 'CODE123',
            message: 'This is a log message',
        };

        const result = validateLogDataFormat(invalidLogData);
        expect(result).toBe(false);
    });

    it('should return false if code is not a string', () => {
        const invalidLogData = {
            timestamp: '2025-08-06T12:00:00Z',
            vehicleId: 12345,
            logLevel: 'INFO',
            code: 123, // Invalid: should be a string
            message: 'This is a log message',
        };

        const result = validateLogDataFormat(invalidLogData);
        expect(result).toBe(false);
    });

    it('should return false if message is not a string', () => {
        const invalidLogData = {
            timestamp: '2025-08-06T12:00:00Z',
            vehicleId: 12345,
            logLevel: 'INFO',
            code: 'CODE123',
            message: 12345, // Invalid: should be a string
        };

        const result = validateLogDataFormat(invalidLogData)
        expect(result).toBe(false);
    });

    it('should return false if any required field is missing', () => {
        const invalidLogData = {
            timestamp: '2025-08-06T12:00:00Z',
            vehicleId: 12345,
            logLevel: 'INFO',
            message: 'This is a log message',
            // Missing code
        };

        const result = validateLogDataFormat(invalidLogData);

        expect(result).toBe(false);
    });
});