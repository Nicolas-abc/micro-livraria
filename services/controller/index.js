const express = require('express');
const shipping = require('./shipping');
const inventory = require('./inventory');
const orders = require('./orders');
const reviews = require('./reviews');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res) => {
    inventory.SearchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res) => {
    shipping.GetShippingRate(
        {
            cep: req.params.cep,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'something failed :(' });
            } else {
                res.json({
                    cep: req.params.cep,
                    value: data.value,
                });
            }
        }
    );
});

/**
 * Registra um novo pedido via OrderService
 */
app.post('/orders', (req, res) => {
    const { productId, quantity } = req.body;
    orders.CreateOrder(
        {
            productId: Number(productId),
            quantity: Number(quantity) || 1,
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'Erro ao processar pedido' });
            } else {
                res.status(201).json(data);
            }
        }
    );
});

/**
 * Lista todos os pedidos realizados via OrderService
 */
app.get('/orders', (req, res) => {
    orders.ListOrders(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Erro ao listar pedidos' });
        } else {
            res.json(data.orders);
        }
    });
});

/**
 * Lista todas as avaliações de um produto via ReviewService
 */
app.get('/products/:id/reviews', (req, res) => {
    reviews.ListReviews(
        { productId: Number(req.params.id) },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'Erro ao listar avaliações' });
            } else {
                res.json(data.reviews || []);
            }
        }
    );
});

/**
 * Cria uma nova avaliação para um produto via ReviewService
 */
app.post('/products/:id/reviews', (req, res) => {
    const { author, rating, comment } = req.body;

    reviews.CreateReview(
        {
            productId: Number(req.params.id),
            author: author || 'Anônimo',
            rating: Number(rating) || 5,
            comment: comment || '',
        },
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'Erro ao registrar avaliação' });
            } else {
                res.status(201).json(data);
            }
        }
    );
});

/**
 * Inicia o router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://0.0.0.0:3000');
});