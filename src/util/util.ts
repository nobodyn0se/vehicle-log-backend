export const validateLogDataFormat = (inputLogData: any): inputLogData is VehicleLogData => {
    return typeof inputLogData.timestamp === 'string' &&
        typeof inputLogData.vehicleId === 'string' &&
        typeof inputLogData.logLevel === 'string' &&
        typeof inputLogData.code === 'string' &&
        typeof inputLogData.message === 'string';
}