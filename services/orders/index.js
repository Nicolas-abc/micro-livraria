const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/orders.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const ordersProto = grpc.loadPackageDefinition(packageDefinition);
const server = new grpc.Server();

const orders = [];

server.addService(ordersProto.OrderService.service, {
    CreateOrder: (call, callback) => {
        const { productId, quantity } = call.request;
        const newOrder = {
            orderId: `ORD-${Date.now()}`,
            productId: productId,
            quantity: quantity || 1,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
        };

        orders.push(newOrder);
        console.log('Novo pedido registrado:', newOrder);

        callback(null, newOrder);
    },
    ListOrders: (_, callback) => {
        callback(null, { orders });
    },
});

server.bindAsync('0.0.0.0:3003', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Orders Service running at http://0.0.0.0:3003');
    server.start();
});