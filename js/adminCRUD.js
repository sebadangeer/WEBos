document.addEventListener('DOMContentLoaded', () => {
    const apiBase = 'http://localhost:8080/api/productos';
    const form = document.getElementById('product-form');
    const tableBody = document.getElementById('products-table-body');
    const tableMessage = document.getElementById('table-message');
    const formMessage = document.getElementById('form-message');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const cancelButton = document.getElementById('cancel-edit');
    const idField = document.getElementById('product-id');
    const fields = ['nombreModelo', 'tipoCategoria', 'precio', 'linkImagen', 'descripcion'];
    const getField = name => document.getElementById(name);
    const money = value => `$ ${Number(value || 0).toLocaleString('es-CL')}`;
    const categoryName = value => ({ jordan: 'Jordan', sports: 'Nike Sports', urban: 'Nike Urban' }[String(value || '').toLowerCase()] || value || 'Sin categoría');

    function showMessage(element, message, isError = false) { element.textContent = message; element.classList.toggle('error', isError); }
    function resetForm() {
        form.reset(); idField.value = ''; formTitle.textContent = 'Nueva zapatilla'; submitButton.textContent = 'Guardar producto'; cancelButton.classList.add('hidden'); showMessage(formMessage, '');
    }
    function fillForm(product) {
        if (!product) return;
        idField.value = product.id;
        fields.forEach(field => { getField(field).value = product[field] ?? ''; });
        formTitle.textContent = 'Editar zapatilla'; submitButton.textContent = 'Actualizar producto'; cancelButton.classList.remove('hidden'); showMessage(formMessage, 'Editando el producto seleccionado.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function renderProducts(products) {
        tableBody.innerHTML = products.length ? products.map(product => `
            <tr><td><div class="product-cell"><img src="${product.linkImagen || ''}" alt="${product.nombreModelo || 'Producto'}" onerror="this.style.visibility='hidden'"><div><p class="product-name">${product.nombreModelo || 'Sin nombre'}</p><p class="product-id">ID: ${product.id}</p></div></div></td><td><span class="category">${categoryName(product.tipoCategoria)}</span></td><td class="price">${money(product.precio)}</td><td><div class="actions"><button class="action-button" type="button" data-action="edit" data-id="${product.id}">Editar</button><button class="action-button delete" type="button" data-action="delete" data-id="${product.id}">Eliminar</button></div></td></tr>`).join('') : '<tr><td colspan="4">No hay productos registrados.</td></tr>';
    }
    async function loadProducts() {
        showMessage(tableMessage, 'Cargando productos...');
        try {
            const response = await fetch(apiBase);
            if (!response.ok) throw new Error('No se pudo obtener el inventario.');
            const products = await response.json(); renderProducts(products);
            showMessage(tableMessage, `${products.length} producto${products.length === 1 ? '' : 's'} registrado${products.length === 1 ? '' : 's'}.`);
        } catch (error) { renderProducts([]); showMessage(tableMessage, `${error.message} Verifica que el backend esté encendido.`, true); }
    }
    function productPayload() {
        return fields.reduce((payload, field) => {
            payload[field] = field === 'precio' ? Number(getField(field).value) : getField(field).value.trim();
            return payload;
        }, {});
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const id = idField.value; submitButton.disabled = true; showMessage(formMessage, id ? 'Actualizando producto...' : 'Guardando producto...');
        try {
            const response = await fetch(id ? `${apiBase}/${id}` : apiBase, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productPayload()) });
            if (!response.ok) throw new Error(await response.text() || 'La operación no pudo completarse.');
            resetForm(); await loadProducts(); showMessage(formMessage, id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
        } catch (error) { showMessage(formMessage, error.message, true); } finally { submitButton.disabled = false; }
    });
    tableBody.addEventListener('click', async event => {
        const button = event.target.closest('[data-action]'); if (!button) return;
        const productId = button.dataset.id;
        if (button.dataset.action === 'edit') {
            try { const response = await fetch(apiBase); const products = await response.json(); fillForm(products.find(product => String(product.id) === productId)); } catch (error) { showMessage(tableMessage, 'No se pudo cargar el producto para editar.', true); }
            return;
        }
        if (button.dataset.action === 'delete' && window.confirm('¿Eliminar esta zapatilla? Esta acción no se puede deshacer.')) {
            button.disabled = true;
            try { const response = await fetch(`${apiBase}/${productId}`, { method: 'DELETE' }); if (!response.ok) throw new Error(await response.text() || 'No se pudo eliminar el producto.'); await loadProducts(); showMessage(formMessage, 'Producto eliminado correctamente.'); } catch (error) { showMessage(tableMessage, error.message, true); button.disabled = false; }
        }
    });
    cancelButton.addEventListener('click', resetForm);
    document.getElementById('refresh-products').addEventListener('click', loadProducts);
    loadProducts();
});