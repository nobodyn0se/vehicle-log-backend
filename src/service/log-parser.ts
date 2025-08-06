import fs from 'fs';
import readline from 'readline';
import winston from "winston";
import {insertVehicleLog} from "../db/client.ts";
import {validateLogDataFormat} from "../util/util.ts";

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
      const match = trimmedLine.match(/\[([^\]]+)] \[([^\]]+)] \[([^\]]+)] \[CODE:([^\]]+)] \[(.*)]/);

      if (match) {
        const [, timestamp, vehicleId, logLevel, code, message] = match;

        const logData = {timestamp, vehicleId, logLevel, code, message};
        if(validateLogDataFormat(logData)) {
            i-- > 0 && logger.info(`${timestamp}, ${vehicleId}, ${logLevel}, ${code}, ${message}`);
            ++records;
            // await insertVehicleLog({timestamp, vehicleId, logLevel, code, message});
        } else {
            logger.error('Invalid log data cannot be inserted into DB');
        }
      } else {
        logger.warn(`No match for line: ${line}`); // Log unmatched lines for debugging
      }
    }

    logger.info(`${records} records were parsed by the system`);
};
