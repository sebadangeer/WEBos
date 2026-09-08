// Este archivo carga la información de un producto concreto y la muestra en detalle.
document.addEventListener('DOMContentLoaded', () => {
    const productId = new URLSearchParams(window.location.search).get('id');
    const title = document.getElementById('product-title');
    const brand = document.getElementById('product-brand');
    const description = document.getElementById('product-description');
    const price = document.getElementById('product-price');
    const image = document.getElementById('product-image');
    const buyButton = document.getElementById('buy-button');

    // Si no llega un ID, indica que no hay producto seleccionado.
    if (!productId) {
        title.textContent = 'Producto no seleccionado';
        description.textContent = 'Regresa a la lista y selecciona un producto para ver sus detalles.';
        buyButton.classList.add('d-none');
        return;
    }

    // Consulta la API para buscar el producto por su ID.
    fetch('https://sneakersource.onrender.com/api/productos')
        .then(response => {
            if (!response.ok) throw new Error('Producto no encontrado');
            return response.json();
        })
        .then(products => {
            const product = products.find(item => String(item.id) === String(productId));
            if (!product) throw new Error('Producto no encontrado');

            // Completa los elementos con los datos reales del producto.
            document.title = `${product.nombreModelo} - Detalles`;
            brand.textContent = product.tipoCategoria || 'Jordan';
            title.textContent = product.nombreModelo;
            description.textContent = product.descripcion || 'Conoce todos los detalles de este producto.';
            price.textContent = `$${Number(product.precio).toLocaleString('es-CL')}`;
            image.src = product.linkImagen;
            image.alt = product.nombreModelo;
            buyButton.href = `compra.html?id=${product.id}`;
        })
        .catch(error => {
            console.error('Hubo un problema al cargar el producto:', error);
            title.textContent = 'No se pudo cargar el producto';
            description.textContent = 'Regresa a la lista e inténtalo nuevamente.';
            buyButton.classList.add('d-none');
        });

    // Efecto visual al mover el cursor sobre la vista del producto.
    const display = document.querySelector('.product-display');
    const shoeImage = document.querySelector('.main-shoe-img');
    const svgLines = document.querySelector('.abstract-lines');
    if (!display || !shoeImage || !svgLines) return;

    display.addEventListener('mousemove', event => {
        const rect = display.getBoundingClientRect();
        const moveX = (event.clientX - rect.left - rect.width / 2) / 15;
        const moveY = (event.clientY - rect.top - rect.height / 2) / 15;
        shoeImage.style.transform = `rotate(-15deg) translate(${moveX}px, ${moveY}px)`;
        svgLines.style.transform = `translate(${-moveX * 0.5}px, ${-moveY * 0.5}px)`;
    });
    display.addEventListener('mouseleave', () => {
        shoeImage.style.transform = 'rotate(-15deg) translate(0px, 0px)';
        svgLines.style.transform = 'translate(0px, 0px)';
    });
});
