const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const InventoryService = grpc.loadPackageDefinition(packageDefinition).InventoryService;
const inventoryHost = process.env.INVENTORY_HOST || '127.0.0.1';
const client = new InventoryService(`${inventoryHost}:3002`, grpc.credentials.createInsecure());

module.exports = client;