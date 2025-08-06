import fs from 'fs';
import { vehicleLogParser } from '../../src/service/log-parser.ts';
import logger from '../../src/middleware/logger.ts';
import {afterEach} from "node:test";
import readline from "readline";

jest.mock('../../src/middleware/logger.ts');

describe('Log parser tests', () => {
    const mockLogger = logger as jest.Mocked<typeof logger>;

    const testLogs = '[2025-01-01 00:00:25] [VEHICLE_ID:1013] [WARN] [CODE:U0420] [Steering angle sensor malfunction]\n' +
        '[2025-01-01 00:00:30] [VEHICLE_ID:1004] [INFO] [CODE:P0171] [System too lean (Bank 1)]\n' +
        '[2025-01-01 00:00:35] [VEHICLE_ID:1014] [ERROR] [CODE:U0420] [Steering angle sensor malfunction]';

    const testPath = 'tests/data/test-logs.txt';

    beforeEach(() => {
        jest.clearAllMocks();
        fs.writeFileSync(testPath, testLogs);
    });

    afterEach(() => {
        fs.unlinkSync(testPath);
    })


    it('should parse the vehicle logs correctly', async () => {
        await vehicleLogParser(testPath, mockLogger);

        expect(mockLogger.info).toHaveBeenCalledWith('Successfully created file stream for the parser');
        expect(mockLogger.info).toHaveBeenCalledWith('Parsing the file stream now...');

        expect(mockLogger.info).toHaveBeenCalledWith('2025-01-01 00:00:25, VEHICLE_ID:1013, WARN, U0420, Steering angle sensor malfunction');
        expect(mockLogger.info).toHaveBeenCalledWith('2025-01-01 00:00:30, VEHICLE_ID:1004, INFO, P0171, System too lean (Bank 1)');
        expect(mockLogger.info).toHaveBeenCalledWith('2025-01-01 00:00:35, VEHICLE_ID:1014, ERROR, U0420, Steering angle sensor malfunction');

        expect(mockLogger.info).toHaveBeenCalledWith('3 records were parsed by the system');
    });
});