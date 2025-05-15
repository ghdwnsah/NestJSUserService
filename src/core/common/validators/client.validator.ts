import { Client } from "@prisma/client";

export async function checkClient(clientInfo: Client) {
    if (!clientInfo) {
        throw new Error("Client not found");
    }
    
    if (clientInfo.isPaid === false) {
        throw new Error("Client is not paid");
    }
    
    if (!clientInfo.dbUrl || !clientInfo.dbName) {
        throw new Error("Database information is missing");
    }
    
    // Add any other necessary checks here
}