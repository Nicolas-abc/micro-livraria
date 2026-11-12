const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/reviews.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const ReviewService = grpc.loadPackageDefinition(packageDefinition).ReviewService;
const reviewsHost = process.env.REVIEWS_HOST || '127.0.0.1';
const client = new ReviewService(`${reviewsHost}:3004`, grpc.credentials.createInsecure());

module.exports = client;
