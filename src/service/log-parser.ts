import fs from 'fs';
import readline from 'readline';
import winston from "winston";

export const vehicleLogParser = async (filePath: string, logger: winston.Logger) => {
    const fileStream = fs.createReadStream(filePath);
    logger.info('Successfully created file stream for the parser');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    logger.info('Parsing the file stream now...');

    let i = 10;
    for await (const line of rl) {
      const trimmedLine = line.trim();
      const match = trimmedLine.match(/\[([^\]]+)] \[([^\]]+)] \[([^\]]+)] \[CODE:([^\]]+)] \[(.*)]/);

      if (match) {
        const [, timestamp, vehicleId, logLevel, code, message] = match;
         i-- > 0 && logger.info(`${timestamp}, ${vehicleId}, ${logLevel}, ${code}, ${message}`);
          // return `${timestamp}, ${vehicleId}, ${logLevel}, ${code}, ${message}`;
      } else {
        logger.warn(`No match for line: ${line}`); // Log unmatched lines for debugging
      }
    }
};
