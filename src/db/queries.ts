export const insertVehicleLogQuery = 'INSERT INTO vehicle_logs (log_id, log_timestamp, vehicle_id, log_level, code, message, created_at, updated_at) VALUES (uuid(), ?, ?, ?, ?, ?, toTimestamp(now()), toTimestamp(now()))';

export const createKeySpaceQuery = `CREATE KEYSPACE IF NOT EXISTS vehicle_keyspace WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 1 }`;

export const useKeySpaceQuery = `USE vehicle_keyspace`;

export const createVehicleLogTableQuery = `CREATE TABLE IF NOT EXISTS vehicle_logs (
    log_id uuid PRIMARY KEY,
    log_timestamp timestamp,
    vehicle_id text,
    log_level text,
    code text,
    message text,
    created_at timestamp,
    updated_at timestamp,
);
`;

export const baseSearchQuery = 'SELECT log_timestamp, vehicle_id, log_level, code, message from vehicle_logs WHERE ';

export const getCountQuery = 'SELECT COUNT(*) from vehicle_logs;'