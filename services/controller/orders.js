const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/orders.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const OrderService = grpc.loadPackageDefinition(packageDefinition).OrderService;
const ordersHost = process.env.ORDERS_HOST || '127.0.0.1';
const client = new OrderService(`${ordersHost}:3003`, grpc.credentials.createInsecure());

module.exports = client;