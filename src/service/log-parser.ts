import fs from 'fs';
import readline from 'readline';
import winston from "winston";
import client, {insertVehicleLog} from "../db/client.ts";
import {convertStringToDateTime, validateLogDataFormat} from "../util/util.ts";

let logBatchSize = 2000;

export const vehicleLogParser = async (filePath: string, logger: winston.Logger) => {
    const fileStream = fs.createReadStream(filePath);
    logger.info('Successfully created file stream for the parser');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    logger.info('Parsing the file stream now...');

    let records = 0;
    let i = 10;
    for await (const line of rl) {
      const trimmedLine = line.trim();
      const match = trimmedLine.match(/\[([^\]]+)] \[VEHICLE_ID:([^\]]+)] \[([^\]]+)] \[CODE:([^\]]+)] \[(.*)]/);

      if (match) {
        const [, rawTimestamp, vehicleId, logLevel, code, message] = match;

        const timestamp = convertStringToDateTime(rawTimestamp);
        const logData = {timestamp, vehicleId, logLevel, code, message};

        if(validateLogDataFormat(logData)) {
            i-- > 0 && logger.info(`${timestamp}, ${vehicleId}, ${logLevel}, ${code}, ${message}`);
            await insertVehicleLog(client, logData);
            ++records;

            if(records % logBatchSize === 0) {
                logger.info(`${records} records inserted into DB`);
            }
        } else {
            logger.error('Invalid log data cannot be inserted into DB');
        }
      } else {
        logger.warn(`No match for line: ${line}`); // Log unmatched lines for debugging
      }
    }

    logger.info(`${records} records were parsed by the system`);
};
