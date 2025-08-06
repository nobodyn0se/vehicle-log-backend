export const validateLogDataFormat = (inputLogData: any): inputLogData is VehicleLogData => {
    return inputLogData.timestamp instanceof Date && !isNaN(inputLogData.timestamp.getTime()) &&
        typeof inputLogData.vehicleId === 'string' &&
        typeof inputLogData.logLevel === 'string' &&
        typeof inputLogData.code === 'string' &&
        typeof inputLogData.message === 'string';
}

export const convertStringToDateTime = (inputString: string): Date => {
    return new Date(inputString);
}