function getReviewSummaryLabel(reviews) {
    if (!reviews || !reviews.length) {
        return 'Seja o primeiro a avaliar';
    }

    const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
    return `Avaliação média: ${average.toFixed(1)} / 5`;
}

function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${Number(book.price).toFixed(2)}</p>
                        <p class="is-size-6">Disponível em estoque: ${book.quantity}</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                        <p class="subtitle is-6 review-summary">Carregando avaliações...</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <button type="button" class="button button-shipping is-info" data-id="${book.id}">
                                Calcular Frete
                            </button>
                        </div>
                    </div>
                    <button type="button" class="button button-buy is-success is-fullwidth">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(id, cep) {
    if (!cep) {
        swal('Erro', 'Informe um CEP para calcular o frete', 'error');
        return;
    }

    fetch(`http://localhost:3000/shipping/${cep}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText || 'Erro ao consultar frete');
        })
        .then((data) => {
            swal('Frete', `O frete para o livro ${id} é: R$${Number(data.value).toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const booksContainer = document.querySelector('.books');

    if (!booksContainer) {
        return;
    }

    fetch('http://localhost:3000/products')
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText || 'Erro ao listar os produtos');
        })
        .then((data) => {
            if (!Array.isArray(data)) {
                return;
            }

            data.forEach((book) => {
                booksContainer.appendChild(newBook(book));
            });

            const reviewRequests = data.map((book) =>
                fetch(`http://localhost:3000/products/${book.id}/reviews`)
                    .then((reviewResponse) => {
                        if (!reviewResponse.ok) {
                            return [];
                        }
                        return reviewResponse.json();
                    })
                    .then((reviews) => {
                        const reviewSummary = document.querySelector(`.book[data-id="${book.id}"] .review-summary`);
                        if (reviewSummary) {
                            reviewSummary.textContent = getReviewSummaryLabel(reviews);
                        }
                    })
                    .catch(() => {
                        const reviewSummary = document.querySelector(`.book[data-id="${book.id}"] .review-summary`);
                        if (reviewSummary) {
                            reviewSummary.textContent = 'Sem avaliações disponíveis';
                        }
                    })
            );

            Promise.all(reviewRequests);

            document.querySelectorAll('.button-buy').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const bookElement = e.target.closest('.book');
                    const bookId = bookElement?.getAttribute('data-id');

                    fetch('http://localhost:3000/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId: Number(bookId), quantity: 1 }),
                    })
                        .then((res) => {
                            if (!res.ok) throw new Error(res.statusText || 'Erro ao processar pedido');
                            return res.json();
                        })
                        .then((order) => {
                            swal(
                                'Compra realizada!',
                                `Pedido ${order.orderId} confirmado com sucesso.`,
                                'success'
                            );
                        })
                        .catch((err) => {
                            swal('Erro', 'Não foi possível concluir a compra', 'error');
                            console.error(err);
                        });
                });
            });

            document.querySelectorAll('.button-shipping').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const bookElement = e.target.closest('.book');
                    const id = bookElement?.getAttribute('data-id');
                    const cep = bookElement?.querySelector('input')?.value || '';
                    calculateShipping(id, cep);
                });
            });
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});
