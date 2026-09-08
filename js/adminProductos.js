// Este archivo gestiona el CRUD de productos para el panel administrativo.
// Permite crear, editar, eliminar y listar zapatillas, además de validar tallas y stock.
document.addEventListener('DOMContentLoaded', () => {
    // Verifica si el usuario actual tiene permisos de administrador o vendedor.
    const role = String(JSON.parse(localStorage.getItem('usuarioSesion') || 'null')?.rol || JSON.parse(localStorage.getItem('usuarioSesion') || 'null')?.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'VENDEDOR') { window.location.replace('acceso.html'); return; }

    // Dirección base del backend para productos.
    const apiBase = 'http://localhost:8080/api/productos';

    // Elementos del formulario y tabla de productos.
    const form = document.getElementById('product-form');
    const tableBody = document.getElementById('products-table-body');
    const tableMessage = document.getElementById('table-message');
    const formMessage = document.getElementById('form-message');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const cancelButton = document.getElementById('cancel-edit');
    const idField = document.getElementById('product-id');
    const sizesList = document.getElementById('sizes-list');
    const sizesMessage = document.getElementById('sizes-message');
    const fields = ['nombreModelo', 'tipoCategoria', 'precio', 'stock', 'stockCritico', 'linkImagen', 'descripcion'];
    const getField = name => document.getElementById(name);
    const money = value => `$ ${Number(value || 0).toLocaleString('es-CL')}`;
    const categoryName = value => ({ jordan: 'Jordan', sports: 'Nike Sports', urban: 'Nike Urban' }[String(value || '').toLowerCase()] || value || 'Sin categoría');

    // Muestra mensajes del estado del formulario o de la tabla.
    function showMessage(element, message, isError = false) { element.textContent = message; element.classList.toggle('error', isError); }

    // Valida un campo numérico entero antes de guardar.
    function validateIntegerField(fieldName, label, min = 0, allowEmpty = false) {
        const field = getField(fieldName);
        const value = field?.value;
        if (!field) return true;
        const numericValue = Number(value);
        if ((value === '' || value === null || typeof value === 'undefined') && allowEmpty) return true;
        if (!Number.isInteger(numericValue) || numericValue < min) {
            showMessage(formMessage, `${label} debe ser un número entero mayor o igual a ${min}.`, true);
            field.focus();
            return false;
        }
        return true;
    }

    // Agrega una fila para registrar una talla y su stock.
    function addSizeRow(size = '', stock = '') {
        const row = document.createElement('div');
        row.className = 'size-row';
        row.innerHTML = `<input class="size-input" type="number" min="1" max="60" step="0.5" placeholder="Talla" aria-label="Talla" value="${size}"><input class="stock-input" type="number" min="0" step="1" placeholder="Stock" aria-label="Stock para la talla" value="${stock}"><button class="remove-size" type="button" aria-label="Eliminar talla">×</button>`;
        row.querySelector('.remove-size').addEventListener('click', () => { row.remove(); validateSizes(); });
        sizesList.appendChild(row);
    }

    // Revisa que todas las tallas tengan un valor válido y sin duplicados.
    function validateSizes() {
        const rows = [...sizesList.querySelectorAll('.size-row')];
        const sizes = rows.map(row => row.querySelector('.size-input').value.trim());
        const hasInvalidRow = rows.some(row => {
            const size = Number(row.querySelector('.size-input').value);
            const stock = Number(row.querySelector('.stock-input').value);
            return !Number.isFinite(size) || size < 1 || size > 60 || !Number.isInteger(stock) || stock < 0;
        });
        const hasDuplicates = sizes.some((size, index) => size && sizes.indexOf(size) !== index);
        const message = !rows.length ? 'Añade al menos una talla.' : hasInvalidRow ? 'Completa cada talla y usa un stock entero igual o mayor que 0.' : hasDuplicates ? 'No puedes repetir una talla.' : '';
        showMessage(sizesMessage, message, Boolean(message));
        return !message;
    }

    // Obtiene un objeto con talla -> stock desde todas las filas del formulario.
    function getSizes() {
        return [...sizesList.querySelectorAll('.size-row')].reduce((sizes, row) => {
            const size = row.querySelector('.size-input').value.trim();
            const stock = Number(row.querySelector('.stock-input').value);
            if (size) sizes[size] = stock;
            return sizes;
        }, {});
    }

    // Limpia el formulario para agregar una nueva zapatilla.
    function resetForm() {
        form.reset(); idField.value = ''; sizesList.replaceChildren(); addSizeRow(); formTitle.textContent = 'Nueva zapatilla'; submitButton.textContent = 'Guardar producto'; cancelButton.classList.add('hidden'); showMessage(formMessage, ''); showMessage(sizesMessage, '');
    }

    // Carga los datos de un producto existente en el formulario para editarlo.
    function fillForm(product) {
        if (!product) return;
        idField.value = product.id;
        fields.forEach(field => { getField(field).value = product[field] ?? ''; });
        sizesList.replaceChildren();
        Object.entries(product.tallasDisponibles || {}).forEach(([size, stock]) => addSizeRow(size, stock));
        if (!sizesList.children.length) addSizeRow();
        formTitle.textContent = 'Editar zapatilla'; submitButton.textContent = 'Actualizar producto'; cancelButton.classList.remove('hidden'); showMessage(formMessage, 'Editando el producto seleccionado.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Calcula el total de unidades disponibles según las tallas.
    function getStockTotal(product = {}) {
        const sizes = product.tallasDisponibles || {};
        return Object.values(sizes).reduce((total, stock) => total + Number(stock || 0), 0);
    }

    // Genera el texto de advertencia cuando el stock está bajo el mínimo crítico.
    function stockWarning(product) {
        const stock = Number(product.stock ?? getStockTotal(product));
        const stockCritico = Number(product.stockCritico ?? 0);
        if (!Number.isFinite(stock) || !Number.isFinite(stockCritico)) return '';
        if (stock <= stockCritico) {
            return `⚠️ Stock crítico: quedan ${stock} unidades`;
        }
        return `Stock actual: ${stock} unidades`;
    }

    // Renderiza la tabla de productos con nombre, categoría, precio y acciones.
    function renderProducts(products) {
        tableBody.innerHTML = products.length ? products.map(product => {
            const stock = Number(product.stock ?? getStockTotal(product));
            const critica = Number(product.stockCritico ?? 0);
            const mensaje = stock <= critica && Number.isFinite(critica) ? 'alerta' : '';
            const stockText = stockWarning(product);
            return `
                <tr><td><div class="product-cell"><img src="${product.linkImagen || ''}" alt="${product.nombreModelo || 'Producto'}" onerror="this.style.visibility='hidden'"><div><p class="product-name">${product.nombreModelo || 'Sin nombre'}</p><p class="product-id">ID: ${product.id}</p></div></div></td><td><span class="category">${categoryName(product.tipoCategoria)}</span></td><td class="price">${money(product.precio)}<small class="stock-summary ${mensaje}">${stockText || sizeSummary(product.tallasDisponibles)}</small></td><td><div class="actions"><button class="action-button" type="button" data-action="edit" data-id="${product.id}">Editar</button><button class="action-button delete" type="button" data-action="delete" data-id="${product.id}">Eliminar</button></div></td></tr>`;
        }).join('') : '<tr><td colspan="4">No hay productos registrados.</td></tr>';
    }

    // Muestra un resumen de las tallas activas para el producto.
    function sizeSummary(sizes = {}) {
        const entries = Object.entries(sizes);
        return entries.length ? `${entries.length} talla${entries.length === 1 ? '' : 's'} / ${entries.reduce((total, [, stock]) => total + Number(stock || 0), 0)} uds.` : 'Sin stock configurado';
    }

    // Trae todos los productos del backend y los inserta en la tabla.
    async function loadProducts() {
        showMessage(tableMessage, 'Cargando productos...');
        try {
            const response = await fetch(apiBase);
            if (!response.ok) throw new Error('No se pudo obtener el inventario.');
            const products = await response.json(); renderProducts(products);
            showMessage(tableMessage, `${products.length} producto${products.length === 1 ? '' : 's'} registrado${products.length === 1 ? '' : 's'}.`);
        } catch (error) { renderProducts([]); showMessage(tableMessage, `${error.message} Verifica que el backend esté encendido.`, true); }
    }

    // Arma el payload que se enviará al backend al crear o actualizar un producto.
    function productPayload() {
        const payload = fields.reduce((result, field) => {
            if (field === 'precio') {
                result[field] = Number(getField(field).value);
            } else if (field === 'stock' || field === 'stockCritico') {
                const value = getField(field).value.trim();
                result[field] = value === '' ? 0 : Number(value);
            } else {
                result[field] = getField(field).value.trim();
            }
            return result;
        }, {});
        payload.tallasDisponibles = getSizes();
        return payload;
    }

    // Guarda o actualiza un producto al enviar el formulario.
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        if (!validateIntegerField('stock', 'Stock', 0) || !validateIntegerField('stockCritico', 'Stock crítico', 0, true)) return;
        if (!validateSizes()) return;
        const stock = Number(getField('stock').value);
        const stockCritico = Number(getField('stockCritico').value || 0);
        if (stockCritico >= 0 && stock <= stockCritico) {
            alert(`Stock crítico: el producto tiene ${stock} unidades disponibles y está en el límite mínimo de ${stockCritico}.`);
        }
        const id = idField.value; submitButton.disabled = true; showMessage(formMessage, id ? 'Actualizando producto...' : 'Guardando producto...');
        try {
            const response = await fetch(id ? `${apiBase}/${id}` : apiBase, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productPayload()) });
            if (!response.ok) throw new Error(await response.text() || 'La operación no pudo completarse.');
            resetForm(); await loadProducts(); showMessage(formMessage, id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
        } catch (error) { showMessage(formMessage, error.message, true); } finally { submitButton.disabled = false; }
    });

    // Maneja clicks sobre editar o eliminar desde la tabla.
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

    // Botón para cancelar edición y añadir nueva talla.
    cancelButton.addEventListener('click', resetForm);
    document.getElementById('add-size').addEventListener('click', () => { addSizeRow(); sizesList.lastElementChild.querySelector('.size-input').focus(); });
    sizesList.addEventListener('input', validateSizes);
    document.getElementById('refresh-products').addEventListener('click', loadProducts);

    // Inicializa la primera fila y carga los productos al abrir la página.
    addSizeRow();
    loadProducts();
});
