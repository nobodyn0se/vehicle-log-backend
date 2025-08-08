export const insertVehicleLogQuery = 'INSERT INTO vehicle_logs (log_id, log_timestamp, vehicle_id, log_level, code, message, created_at, updated_at) VALUES (uuid(), ?, ?, ?, ?, ?, toTimestamp(now()), toTimestamp(now()))';

export const createKeySpaceQuery = `CREATE KEYSPACE IF NOT EXISTS vehicle_keyspace WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 1 }`;

export const useKeySpaceQuery = `USE vehicle_keyspace`;

export const createVehicleLogTableQuery = `CREATE TABLE IF NOT EXISTS vehicle_logs (
                                                                               vehicle_id text,
                                                                               code text,
                                                                               log_timestamp timestamp,
                                                                               log_id uuid,
                                                                               log_level text,
                                                                               message text,
                                                                               created_at timestamp,
                                                                               updated_at timestamp,
                                                                               PRIMARY KEY ((vehicle_id, code), log_timestamp, log_id)
    ) WITH CLUSTERING ORDER BY (log_timestamp DESC, log_id ASC);

`;

export const baseSearchQuery = 'SELECT log_timestamp, vehicle_id, log_level, code, message from vehicle_logs WHERE ';

export const getCountQuery = `SELECT count_value from vehicle_logs_count where key = 'count';`

export const initCountRowQuery = `UPDATE vehicle_logs_count SET count_value = count_value + 0 WHERE key = 'count'`;

export const updateCountQuery = `UPDATE vehicle_logs_count SET count_value = count_value + ? WHERE key = 'count'`;

export const createCountTableQuery = `CREATE TABLE IF NOT EXISTS vehicle_logs_count (key text primary key, count_value counter);`
