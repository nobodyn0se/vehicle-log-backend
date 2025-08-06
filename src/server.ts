import express from 'express';
import logger from './middleware/logger.ts';
import { vehicleLogParser } from './service/log-parser.ts';
import client, {connectCassandra, createKeySpace, createLogTable, useKeySpace} from "./db/client.ts";
import router from "./routes/general-routes.ts";

const app = express();

app.use(express.json());
app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);
    await connectCassandra(client);
    await createKeySpace(client);
    await useKeySpace(client);
    await createLogTable(client);

    vehicleLogParser('data/vehicle_diagnostics_logs.txt', logger);
})



