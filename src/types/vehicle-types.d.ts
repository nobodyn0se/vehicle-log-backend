export {};

declare global {
    type VehicleLogData = {
        timestamp: string;
        vehicleId: string;
        logLevel: string;
        code: string;
        message: string;
    }
}