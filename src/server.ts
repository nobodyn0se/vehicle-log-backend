import express from 'express';
import logger from './middleware/logger';
import { vehicleLogParser } from './service/log-parser';

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    vehicleLogParser('data/vehicle_diagnostics_logs.txt', logger);
})



