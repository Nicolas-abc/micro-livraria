const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/reviews.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const reviewsProto = grpc.loadPackageDefinition(packageDefinition);
const server = new grpc.Server();

const reviewsByProduct = {
    1: [
        {
            productId: 1,
            author: 'Ana',
            rating: 5,
            comment: 'Excelente leitura e muito bem escrita.',
            createdAt: new Date().toISOString(),
        },
        {
            productId: 1,
            author: 'João',
            rating: 4,
            comment: 'Ótimo livro para quem gosta de clean code.',
            createdAt: new Date().toISOString(),
        },
    ],
    2: [
        {
            productId: 2,
            author: 'Maria',
            rating: 5,
            comment: 'Muito didático e claro.',
            createdAt: new Date().toISOString(),
        },
    ],
    3: [
        {
            productId: 3,
            author: 'Pedro',
            rating: 4,
            comment: 'Útil para revisão de padrões de projeto.',
            createdAt: new Date().toISOString(),
        },
    ],
};

server.addService(reviewsProto.ReviewService.service, {
    ListReviews: (call, callback) => {
        const productId = Number(call.request.productId);
        const reviews = reviewsByProduct[productId] || [];

        callback(null, { reviews });
    },
    CreateReview: (call, callback) => {
        const payload = call.request;
        const review = {
            productId: Number(payload.productId),
            author: payload.author || 'Anônimo',
            rating: Number(payload.rating) || 5,
            comment: payload.comment || '',
            createdAt: new Date().toISOString(),
        };

        if (!reviewsByProduct[review.productId]) {
            reviewsByProduct[review.productId] = [];
        }

        reviewsByProduct[review.productId].push(review);
        callback(null, review);
    },
});

server.bindAsync('0.0.0.0:3004', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Reviews Service running at http://0.0.0.0:3004');
    server.start();
});
