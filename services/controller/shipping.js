const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/shipping.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const ShippingService = grpc.loadPackageDefinition(packageDefinition).ShippingService;
const shippingHost = process.env.SHIPPING_HOST || '127.0.0.1';
const client = new ShippingService(`${shippingHost}:3001`, grpc.credentials.createInsecure());

module.exports = client;