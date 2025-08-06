import {baseSearchQuery} from "../db/queries.ts";
import client from "../db/client.ts";
import logger from "../middleware/logger.ts";
import {Request, Response} from "express";

export const logController = async (req: Request, res: Response) => {
    const vehicleId = typeof req.query.vehicle === 'string' ? req.query.vehicle : undefined;
    const code = typeof req.query.code === 'string' ? req.query.code : undefined;

    const from = req.query.from;
    const to = req.query.to;

    let fromDate = from && typeof from === 'string' ? new Date(from) : undefined;
    let toDate = to && typeof to === 'string' ? new Date(to) : undefined;

    if(!vehicleId && !code && !fromDate && !toDate) {
        logger.warn('No parameters provided for query search');
        res.status(400).send('Provide one of these - vehicle ID, error code or dates');
    }

    const searchFilters = { vehicleId, code, fromDate, toDate };
    const {finalQuery, params} = searchQueryBuilder(searchFilters);

    try {
        const result = await client.execute(finalQuery, params);
        logger.info('Fetched results for received query');
        res.status(200).send(JSON.stringify(result));
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
}

const searchQueryBuilder = (searchFilters: QueryData) =>  {
    let baseQuery = baseSearchQuery;
    let params = [];
    let conditions = [];

    if(searchFilters.vehicleId) {
        conditions.push('vehicle_id = ?');
        params.push(searchFilters.vehicleId);
    }

    if(searchFilters.code) {
        conditions.push('code = ?');
        params.push(searchFilters.code);
    }

    if(searchFilters.fromDate && searchFilters.toDate) {
        conditions.push('log_timestamp >= ? AND log_timestamp <= ?');
        params.push(searchFilters.fromDate, searchFilters.toDate);
    }

    const finalQuery = baseQuery + conditions.join(' AND ') + ' ALLOW FILTERING';
    return { finalQuery, params };
}