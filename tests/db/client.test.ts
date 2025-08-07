import type {Client} from 'cassandra-driver';
import {connectCassandra, insertVehicleLog, populateDBIfEmpty} from "../../src/db/client.ts";
import logger from '../../src/middleware/logger.ts';
import {vehicleLogParser} from "../../src/service/log-parser.ts";
import {getCountQuery} from "../../src/db/queries.ts";
import {mock} from "node:test";

jest.mock('../../src/middleware/logger.ts');
jest.mock('../../src/service/log-parser.ts', () => ({
    vehicleLogParser: jest.fn(),
}));

describe('DB Client tests', () => {
    const mockConnect = jest.fn();
    const mockExecute = jest.fn();

    const mockClient = {
        connect: mockConnect,
        execute: mockExecute,
    } as Partial<jest.Mocked<Client>> as Client;

    const mockedLogger = logger as jest.Mocked<typeof logger>;

    const logData = {
        timestamp: new Date("2025-01-01 00:00:25"),
        vehicleId: "1013",
        logLevel: "WARN",
        code: "U0420",
        message: "Steering angle sensor malfunction"
    };

    const invalidLogData = {
        timestamp: "2025-01-01 00:00:25",
        vehicleId: 1013,
        logLevel: "WARN",
        code: "U0420",
        message: "Steering angle sensor malfunction"
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to Cassandra', async () => {
        mockConnect.mockResolvedValueOnce(undefined);

        await connectCassandra(mockClient);

        expect(mockClient.connect).toHaveBeenCalledTimes(1);
        expect(mockedLogger.info).toHaveBeenCalledWith('Connected to Cassandra');
        expect(mockedLogger.error).not.toHaveBeenCalled();
    });

    it('should log an error while connecting to Cassandra', async () => {
        const connectionError = new Error('Connection failure');
        mockConnect.mockRejectedValueOnce(connectionError);

        await connectCassandra(mockClient);

        expect(mockClient.connect).toHaveBeenCalled();
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
        expect(mockedLogger.info).toHaveBeenCalledTimes(0);
    });

    it('should successfully insert a vehicle log into the DB', async () => {
        mockExecute.mockResolvedValueOnce(undefined);

        await insertVehicleLog(mockClient, logData);

        expect(mockClient.execute).toHaveBeenCalledTimes(1);
        expect(mockedLogger.error).not.toHaveBeenCalled();
    });

    it('should throw an error while inserting a vehicle log', async () => {
        const insertError = new Error("Log insert failure");
        mockExecute.mockRejectedValueOnce(insertError);

        await insertVehicleLog(mockClient, logData);

        expect(mockClient.execute).toHaveBeenCalled();
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when invalid data is inserted', async () => {
        const invalidDataError = new Error('Invalid data insertion attempt');
        mockExecute.mockRejectedValueOnce(invalidDataError);

        await insertVehicleLog(mockClient, invalidLogData);

        expect(mockClient.execute).toHaveBeenCalled();
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should populate the empty DB succesfully', async () => {
       mockExecute.mockResolvedValueOnce({ rows: [{count: '0'}]});
       (vehicleLogParser as jest.Mock).mockResolvedValueOnce(undefined);

       await populateDBIfEmpty(mockClient);

       expect(mockExecute).toHaveBeenCalledWith(getCountQuery);
       expect(vehicleLogParser).toHaveBeenCalledWith('data/vehicle_diagnostics_logs.txt', mockedLogger);
       expect(mockedLogger.info).toHaveBeenCalledWith('Database is empty, populating data...');
    });

    it('should not populate the DB if there are records already present', async () => {
        mockExecute.mockResolvedValueOnce({ rows: [{count: '1000'}]});

        await populateDBIfEmpty(mockClient);

        expect(mockExecute).toHaveBeenCalledWith(getCountQuery);
        expect(vehicleLogParser).not.toHaveBeenCalled();
        expect(mockedLogger.info).toHaveBeenCalledWith('Vehicle log table already populated, skipped inserts...');
    });

    it('should throw an error if it could not get DB count', async () =>{
       const dbCountError = new Error('Could not get count from DB');
       mockExecute.mockRejectedValueOnce(dbCountError);

       await populateDBIfEmpty(mockClient);

       expect(mockExecute).toHaveBeenCalledWith(getCountQuery);
       expect(vehicleLogParser).not.toHaveBeenCalled();
       expect(mockedLogger.info).not.toHaveBeenCalled();
       expect(mockedLogger.error).toHaveBeenCalledTimes(1);
    });
})