import {Client} from 'cassandra-driver';
import {insertVehicleLogQuery} from "./queries.ts";
import logger from "../middleware/logger.ts";

const client = new Client({
    contactPoints: ['127.0.0.1'], // Change this if your Cassandra instance is hosted elsewhere
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

export const insertVehicleLog = async (client: Client, logData: VehicleLogData) => {

    try {
        await client.execute(insertVehicleLogQuery, [logData.timestamp, logData.vehicleId, logData.logLevel, logData.code, logData.message], {prepare: true});
    } catch (error) {
        logger.error('Could not insert vehicle log', error);
    }
}

export default client;
