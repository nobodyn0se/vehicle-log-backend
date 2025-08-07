import {Client} from 'cassandra-driver';
import {
    createKeySpaceQuery,
    createVehicleLogTableQuery,
    getCountQuery,
    insertVehicleLogQuery,
    useKeySpaceQuery
} from "./queries.ts";
import logger from "../middleware/logger.ts";
import {vehicleLogParser} from "../service/log-parser.ts";

const client = new Client({
    contactPoints: ['127.0.0.1:9042'], // Change this if your Cassandra instance is hosted elsewhere
    localDataCenter: 'datacenter1', // Adjust based on your setup
});

export const connectCassandra = async (client: Client) => {
    try {
        await client.connect();
        logger.info('Connected to Cassandra');
    } catch (error) {
        logger.error('Error connecting to Cassandra', error);
    }
};

export const createKeySpace = async(client: Client) => {
    try {
        await client.execute(createKeySpaceQuery);
        logger.info('Key space created or already exists');
    } catch (error) {
        logger.error('Error creating keyspace', error);
    }
};

export const useKeySpace = async(client: Client) => {
    try {
        await client.execute(useKeySpaceQuery);
        logger.info('Using keyspace for vehicles');
    } catch (error) {
        logger.error('Error using keyspace', error);
    }
}

export const createLogTable = async (client: Client) => {
    try {
        await client.execute(createVehicleLogTableQuery);
        logger.info('Vehicle log table created or already exists');
    } catch (error) {
        logger.error('Error creating log table', error);
    }
};

export const insertVehicleLog = async (client: Client, logData: VehicleLogData) => {
    try {
        await client.execute(insertVehicleLogQuery, [logData.timestamp, logData.vehicleId, logData.logLevel, logData.code, logData.message], {prepare: true});
    } catch (error) {
        logger.error('Could not insert vehicle log', error);
    }
}

export const populateDBIfEmpty = async (client: Client) => {
    try {
        const result = await client.execute(getCountQuery);
        if(parseInt(result.rows[0]['count']) === 0) {
            logger.info('Database is empty, populating data...');
            await vehicleLogParser('data/vehicle_diagnostics_logs.txt', logger);
        } else {
            logger.info('Vehicle log table populated or already exists');
        }
    } catch(error) {
        logger.error('Could not get database status', error);
    }
}

export default client;
