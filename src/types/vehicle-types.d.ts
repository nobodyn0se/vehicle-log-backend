export {};

declare global {
    type VehicleLogData = {
        timestamp: Date;
        vehicleId: string;
        logLevel: string;
        code: string;
        message: string;
    }
}