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

    const usersApiBase = 'http://localhost:8080/api/clientes';
    const userForm = document.getElementById('user-form');
    const usersTableBody = document.getElementById('users-table-body');
    const usersTableMessage = document.getElementById('users-table-message');
    const userFormMessage = document.getElementById('user-form-message');
    const userFormTitle = document.getElementById('user-form-title');
    const userSubmitButton = document.getElementById('user-submit-button');
    const cancelUserButton = document.getElementById('cancel-user-edit');
    const userIdField = document.getElementById('user-id');
    const userFields = ['nombreCompleto', 'email', 'contrasena', 'numero', 'region', 'comuna'];
    const getUserField = name => document.getElementById(name);
    const userId = user => user.id ?? user.idCliente;
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

    function resetUserForm() {
        userForm.reset(); userIdField.value = ''; userFormTitle.textContent = 'Nuevo usuario'; userSubmitButton.textContent = 'Guardar usuario'; cancelUserButton.classList.add('hidden'); showMessage(userFormMessage, '');
    }
    function fillUserForm(user) {
        userIdField.value = userId(user);
        userFields.forEach(field => { if (field !== 'contrasena') getUserField(field).value = user[field] ?? ''; });
        getUserField('contrasena').value = '';
        userFormTitle.textContent = 'Editar usuario'; userSubmitButton.textContent = 'Actualizar usuario'; cancelUserButton.classList.remove('hidden'); showMessage(userFormMessage, 'Editando el usuario seleccionado.');
        window.scrollTo({ top: document.querySelector('.users-admin').offsetTop, behavior: 'smooth' });
    }
    function renderUsers(users) {
        usersTableBody.innerHTML = users.length ? users.map(user => `
            <tr><td><p class="product-name">${escapeHtml(user.nombreCompleto || user.pnombre || 'Sin nombre')}</p><p class="product-id">ID: ${escapeHtml(userId(user))}</p></td><td>${escapeHtml(user.email || 'Sin correo')}<br><span class="product-id">${escapeHtml(user.numero || 'Sin teléfono')}</span></td><td>${escapeHtml(user.comuna || 'Sin comuna')}<br><span class="product-id">${escapeHtml(user.region || 'Sin región')}</span></td><td><div class="actions"><button class="action-button" type="button" data-user-action="edit" data-id="${escapeHtml(userId(user))}">Editar</button><button class="action-button delete" type="button" data-user-action="delete" data-id="${escapeHtml(userId(user))}">Eliminar</button></div></td></tr>`).join('') : '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
    }
    async function loadUsers() {
        showMessage(usersTableMessage, 'Cargando usuarios...');
        try {
            const response = await fetch(usersApiBase);
            if (!response.ok) throw new Error('No se pudo obtener la lista de usuarios.');
            const users = await response.json(); renderUsers(users);
            showMessage(usersTableMessage, `${users.length} usuario${users.length === 1 ? '' : 's'} registrado${users.length === 1 ? '' : 's'}.`);
        } catch (error) { renderUsers([]); showMessage(usersTableMessage, `${error.message} Verifica que el backend esté encendido.`, true); }
    }
    function userPayload() {
        return userFields.reduce((payload, field) => {
            const value = getUserField(field).value.trim();
            if (field !== 'contrasena' || value) payload[field] = value;
            return payload;
        }, {});
    }
    userForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!userForm.checkValidity()) { userForm.reportValidity(); return; }
        const id = userIdField.value; const payload = userPayload();
        if (!id && !payload.contrasena) { showMessage(userFormMessage, 'La contraseña es obligatoria para crear un usuario.', true); return; }
        userSubmitButton.disabled = true; showMessage(userFormMessage, id ? 'Actualizando usuario...' : 'Guardando usuario...');
        try {
            const response = await fetch(id ? `${usersApiBase}/${id}` : usersApiBase, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(await response.text() || 'La operación no pudo completarse.');
            resetUserForm(); await loadUsers(); showMessage(userFormMessage, id ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        } catch (error) { showMessage(userFormMessage, error.message, true); } finally { userSubmitButton.disabled = false; }
    });
    usersTableBody.addEventListener('click', async event => {
        const button = event.target.closest('[data-user-action]'); if (!button) return;
        const selectedId = button.dataset.id;
        if (button.dataset.userAction === 'edit') {
            try { const response = await fetch(usersApiBase); const users = await response.json(); fillUserForm(users.find(user => String(userId(user)) === selectedId)); } catch (error) { showMessage(usersTableMessage, 'No se pudo cargar el usuario para editar.', true); }
            return;
        }
        if (button.dataset.userAction === 'delete' && window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
            button.disabled = true;
            try { const response = await fetch(`${usersApiBase}/${selectedId}`, { method: 'DELETE' }); if (!response.ok) throw new Error(await response.text() || 'No se pudo eliminar el usuario.'); await loadUsers(); showMessage(userFormMessage, 'Usuario eliminado correctamente.'); } catch (error) { showMessage(usersTableMessage, error.message, true); button.disabled = false; }
        }
    });
    cancelUserButton.addEventListener('click', resetUserForm);
    document.getElementById('refresh-users').addEventListener('click', loadUsers);
    loadUsers();
});