// Este archivo carga los productos según la categoría de la página actual.
// Ejemplo: Jordan, Nike Sports o Nike Urban, y los renderiza como tarjetas.
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('productos-contenedor');
    if (!container) return;

    // Determina qué tipo de productos mostrar según la URL de la página.
    const path = window.location.pathname.toLowerCase();
    const category = path.includes('catjordan')
        ? 'jordan'
        : path.includes('catnikeurban')
            ? 'urban'
            : 'sports';

    // Si la página es de listado general, consulta todos los productos; si no, filtra por categoría.
    const apiUrl = path.includes('listarproductos')
        ? 'http://localhost:8080/api/productos'
        : `http://localhost:8080/api/productos/categoria/${category}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener los productos');
            return response.json();
        })
        .then(products => {
            // Crea el HTML de cada tarjeta de producto y lo agrega al contenedor principal.
            container.innerHTML = products.map(product => {
                const price = Number(product.precio).toLocaleString('es-CL');
                return `
                    <div class="card">
                        <input type="radio" name="sneaker${product.id}" id="c${product.id}-v1" class="r-1" checked>
                        <input type="radio" name="sneaker${product.id}" id="c${product.id}-v2" class="r-2">
                        <input type="radio" name="sneaker${product.id}" id="c${product.id}-v3" class="r-3">
                        <a href="detalle.html?id=${product.id}" class="slider" aria-label="Ver detalles de ${product.nombreModelo}">
                            <div class="slide img-1"><img src="${product.linkImagen}" alt="${product.nombreModelo}"></div>
                            <div class="slide img-2"><img src="${product.linkImagen}" alt="${product.nombreModelo}"></div>
                            <div class="slide img-3"><img src="${product.linkImagen}" alt="${product.nombreModelo}"></div>
                            <div class="nav nav-left">
                                <label for="c${product.id}-v3" class="to-3">←</label>
                                <label for="c${product.id}-v2" class="to-2">←</label>
                                <label for="c${product.id}-v1" class="to-1">←</label>
                            </div>
                            <div class="nav nav-right">
                                <label for="c${product.id}-v3" class="to-3">→</label>
                                <label for="c${product.id}-v2" class="to-2">→</label>
                                <label for="c${product.id}-v1" class="to-1">→</label>
                            </div>
                        </a>
                        <a href="detalle.html?id=${product.id}" class="info text-decoration-none">
                            <span class="code">${product.tipoCategoria || 'Jordan'}</span>
                            <h2>${product.nombreModelo}</h2>
                            <p class="price">$ ${price}</p>
                        </a>
                        <a href="compra.html?id=${product.id}" class="btn-buy mb-2">Agregar al Carrito</a>
                        <a href="detalle.html?id=${product.id}" class="btn-buy">Ver Detalles</a>
                    </div>`;
            }).join('');
        })
        .catch(error => {
            console.error('Hubo un problema con la petición Fetch:', error);
            container.innerHTML = '<h3 style="color:red; grid-column: 1/-1; text-align:center;">No se pudieron cargar los productos. Verifica que el servidor backend esté encendido.</h3>';
        });
});
