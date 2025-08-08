import fs from 'fs';
import readline from 'readline';
import winston from "winston";
import client, {insertVehicleLog, updateRecordCount} from "../db/client.ts";
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
    const batch: any[] = [];
    const batchSize = 100; // Adjust based on your performance needs
    const maxConcurrency = 5; // Limit concurrent database operations

    const insertBatch = async (batch: any[]) => {
        if (batch.length === 0) return;

        try {
            const insertPromises = batch.map(logData =>
                insertVehicleLog(client, logData)
            );

            await Promise.all(insertPromises);

            await updateRecordCount(client, batch.length);

            logger.info(`${batch.length} records inserted into DB`);
        } catch (error) {
            logger.error('Batch insert failed', error);
        }
    };

    const semaphore = new AsyncSemaphore(maxConcurrency);

    for await (const line of rl) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(/\[([^\]]+)] \[VEHICLE_ID:([^\]]+)] \[([^\]]+)] \[CODE:([^\]]+)] \[(.*)]/);

        if (match) {
            const [, rawTimestamp, vehicleId, logLevel, code, message] = match;

            const timestamp = convertStringToDateTime(rawTimestamp);
            const logData = {timestamp, vehicleId, logLevel, code, message};

            if(validateLogDataFormat(logData)) {
                i-- > 0 && logger.info(`${timestamp}, ${vehicleId}, ${logLevel}, ${code}, ${message}`);

                batch.push(logData);
                ++records;

                if (batch.length >= batchSize) {
                    await semaphore.acquire();
                    insertBatch(batch.splice(0, batchSize))
                        .finally(() => semaphore.release());
                }
            } else {
                logger.error('Invalid log data cannot be inserted into DB');
            }
        } else {
            logger.warn(`No match for line: ${line}`);
        }
    }

    // Insert any remaining records
    if (batch.length > 0) {
        await insertBatch(batch);
    }

    logger.info(`${records} records were parsed by the system`);
};

// Simple Async Semaphore for controlling concurrency
class AsyncSemaphore {
    private permits: number;
    private queue: (() => void)[];

    constructor(permits: number) {
        this.permits = permits;
        this.queue = [];
    }

    async acquire() {
        return new Promise<void>((resolve) => {
            if (this.permits > 0) {
                this.permits--;
                resolve();
            } else {
                this.queue.push(resolve);
            }
        });
    }

    release() {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next && next();
        } else {
            this.permits++;
        }
    }
}

