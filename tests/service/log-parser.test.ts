import fs from 'fs';
import { vehicleLogParser } from '../../src/service/log-parser.ts';
import {Logger} from "winston";

describe('Log parser tests', () => {
    let mockLogger: Logger;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as unknown as Logger;
    });


    it('should parse the vehicle logs correctly', async () => {
        const testLogs = '[2025-01-01 00:00:25] [VEHICLE_ID:1013] [WARN] [CODE:U0420] [Steering angle sensor malfunction]\n' +
            '[2025-01-01 00:00:30] [VEHICLE_ID:1004] [INFO] [CODE:P0171] [System too lean (Bank 1)]\n' +
            '[2025-01-01 00:00:35] [VEHICLE_ID:1014] [ERROR] [CODE:U0420] [Steering angle sensor malfunction]';

        const testPath = 'tests/data/test-logs.txt';
        fs.writeFileSync(testPath, testLogs);

        await vehicleLogParser(testPath, mockLogger);

        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('2025-01-01 00:00:25'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('VEHICLE_ID:1013'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('WARN'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('U0420'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Steering angle sensor malfunction'));

        // Check for the second log entry (INFO)
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('2025-01-01 00:00:30'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('VEHICLE_ID:1004'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('INFO'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('P0171'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('System too lean (Bank 1)'));

        // Check for the third log entry (ERROR)
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('2025-01-01 00:00:35'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('VEHICLE_ID:1014'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('ERROR'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('U0420'));
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Steering angle sensor malfunction'));

        fs.unlinkSync(testPath); // Clean up
    });
});