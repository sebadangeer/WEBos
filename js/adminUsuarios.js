// Este archivo administra la lista de usuarios desde el panel de administración.
// Permite listar clientes, editar sus datos y eliminarlos cuando sea necesario.
document.addEventListener('DOMContentLoaded', () => {
    // Comprueba que la sesión exista y que el usuario sea administrador.
    const session = JSON.parse(localStorage.getItem('usuarioSesion') || 'null');
    if (String(session?.rol || session?.role || '').toUpperCase() !== 'ADMIN') { window.location.replace('adminProductos.html'); return; }

    // Base de la API para usuarios.
    const apiBase = 'http://localhost:8080/api/clientes';

    // Elementos de la interfaz de administración.
    const form = document.getElementById('user-form');
    const tableBody = document.getElementById('users-table-body');
    const tableMessage = document.getElementById('users-table-message');
    const formMessage = document.getElementById('user-form-message');
    const formTitle = document.getElementById('user-form-title');
    const submitButton = document.getElementById('user-submit-button');
    const cancelButton = document.getElementById('cancel-user-edit');
    const idField = document.getElementById('user-id');
    const regionField = document.getElementById('region');
    const comunaField = document.getElementById('comuna');
    const fields = ['nombreCompleto', 'email', 'contrasena', 'numero', 'region', 'direccion', 'comuna'];
    const getField = name => document.getElementById(name);
    const userId = user => user.id ?? user.idCliente;
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
    const regionLabels = Object.fromEntries(
        (window.ubicacionChile?.regiones || []).map(region => [region.id, region.nombre])
    );
    const regiones = window.ubicacionChile?.regiones || [];

    // Carga las regiones del catálogo compartido en el formulario administrativo.
    regiones.forEach(region => {
        regionField.add(new Option(region.nombre, region.id));
    });

    // Carga únicamente las comunas pertenecientes a la región seleccionada.
    function loadComunas(regionId, selectedComuna = '') {
        const region = regiones.find(item => item.id === regionId);
        comunaField.innerHTML = '<option value="">Seleccione una comuna</option>';
        comunaField.disabled = !region;
        (region?.comunas || []).forEach(comuna => {
            const value = normalizeLocationValue('comuna', comuna);
            comunaField.add(new Option(comuna, value, false, value === selectedComuna));
        });
    }

    regionField.addEventListener('change', () => loadComunas(regionField.value));

    function formatRegionValue(value) {
        const raw = String(value ?? '').trim();
        if (!raw) return '';
        const lower = raw.toLowerCase();
        const match = Object.entries(regionLabels).find(([id, label]) => id === lower || label.toLowerCase() === lower || label.toLowerCase().replace(/\s+/g, ' ') === lower.replace(/-/g, ' '));
        return match ? regionLabels[match[0]] : raw.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    function formatComunaValue(value) {
        const raw = String(value ?? '').trim();
        if (!raw) return '';
        return raw
            .replace(/-/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }

    function normalizeLocationValue(field, value) {
        const raw = String(value ?? '').trim();
        if (!raw) return '';
        if (field === 'region') {
            const lower = raw.toLowerCase();
            const match = Object.entries(regionLabels).find(([id, label]) => id === lower || label.toLowerCase() === lower || label.toLowerCase().replace(/\s+/g, ' ') === lower.replace(/-/g, ' '));
            return match ? match[0] : lower;
        }
        if (field === 'comuna') {
            return raw.toLowerCase().replace(/\s+/g, '-');
        }
        return raw;
    }

    // Muestra mensajes de éxito o error en distintas secciones.
    function showMessage(element, message, isError = false) { element.textContent = message; element.classList.toggle('error', isError); }

    // Resetea el formulario para crear un usuario nuevo.
    function resetForm() {
        form.reset(); idField.value = ''; loadComunas(''); formTitle.textContent = 'Nuevo usuario'; submitButton.textContent = 'Guardar usuario'; cancelButton.classList.add('hidden'); showMessage(formMessage, '');
    }

    // Carga los datos de un usuario en el formulario para editar.
    function fillForm(user) {
        idField.value = userId(user);
        fields.forEach(field => {
            if (field === 'contrasena' || field === 'comuna') return;
            const rawValue = user[field] ?? '';
            getField(field).value = field === 'region' ? normalizeLocationValue(field, rawValue) : rawValue;
        });
        loadComunas(regionField.value, normalizeLocationValue('comuna', user.comuna));
        getField('contrasena').value = '';
        formTitle.textContent = 'Editar usuario'; submitButton.textContent = 'Actualizar usuario'; cancelButton.classList.remove('hidden'); showMessage(formMessage, 'Editando el usuario seleccionado.');
        window.scrollTo({ top: document.querySelector('.users-admin').offsetTop, behavior: 'smooth' });
    }

    // Renderiza la lista de usuarios dentro de la tabla.
    function renderUsers(users) {
        tableBody.innerHTML = users.length ? users.map(user => `
            <tr><td><p class="product-name">${escapeHtml(user.nombreCompleto || user.pnombre || 'Sin nombre')}</p><p class="product-id">ID: ${escapeHtml(userId(user))}</p></td><td>${escapeHtml(user.email || 'Sin correo')}<br><span class="product-id">${escapeHtml(user.numero || 'Sin teléfono')}</span></td><td>${escapeHtml(user.direccion || 'Sin dirección')}<br><span class="product-id">${escapeHtml(formatComunaValue(user.comuna) || 'Sin comuna')} · ${escapeHtml(formatRegionValue(user.region) || 'Sin región')}</span></td><td><div class="actions"><button class="action-button" type="button" data-user-action="edit" data-id="${escapeHtml(userId(user))}">Editar</button><button class="action-button delete" type="button" data-user-action="delete" data-id="${escapeHtml(userId(user))}">Eliminar</button></div></td></tr>`).join('') : '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
    }

    // Carga la lista de clientes desde la API.
    async function loadUsers() {
        showMessage(tableMessage, 'Cargando usuarios...');
        try {
            const response = await fetch(apiBase);
            if (!response.ok) throw new Error('No se pudo obtener la lista de usuarios.');
            const users = await response.json(); renderUsers(users);
            showMessage(tableMessage, `${users.length} usuario${users.length === 1 ? '' : 's'} registrado${users.length === 1 ? '' : 's'}.`);
        } catch (error) { renderUsers([]); showMessage(tableMessage, `${error.message} Verifica que el backend esté encendido.`, true); }
    }

    // Arma el objeto para guardar o actualizar el usuario.
    function userPayload() {
        return fields.reduce((payload, field) => {
            const rawValue = getField(field).value.trim();
            const value = field === 'region' || field === 'comuna' ? normalizeLocationValue(field, rawValue) : rawValue;
            if (field !== 'contrasena' || value) payload[field] = value;
            return payload;
        }, {});
    }

    // Envío del formulario para crear o actualizar usuario.
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const id = idField.value; const payload = userPayload();
        if (!id && !payload.contrasena) { showMessage(formMessage, 'La contraseña es obligatoria para crear un usuario.', true); return; }
        submitButton.disabled = true; showMessage(formMessage, id ? 'Actualizando usuario...' : 'Guardando usuario...');
        try {
            const response = await fetch(id ? `${apiBase}/${id}` : apiBase, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(await response.text() || 'La operación no pudo completarse.');
            resetForm(); await loadUsers(); showMessage(formMessage, id ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        } catch (error) { showMessage(formMessage, error.message, true); } finally { submitButton.disabled = false; }
    });

    // Maneja los clicks de editar y eliminar dentro de la tabla de usuarios.
    tableBody.addEventListener('click', async event => {
        const button = event.target.closest('[data-user-action]'); if (!button) return;
        const selectedId = button.dataset.id;
        if (button.dataset.userAction === 'edit') {
            try { const response = await fetch(apiBase); const users = await response.json(); fillForm(users.find(user => String(userId(user)) === selectedId)); } catch (error) { showMessage(tableMessage, 'No se pudo cargar el usuario para editar.', true); }
            return;
        }
        if (button.dataset.userAction === 'delete' && window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
            button.disabled = true;
            try { const response = await fetch(`${apiBase}/${selectedId}`, { method: 'DELETE' }); if (!response.ok) throw new Error(await response.text() || 'No se pudo eliminar el usuario.'); await loadUsers(); showMessage(formMessage, 'Usuario eliminado correctamente.'); } catch (error) { showMessage(tableMessage, error.message, true); button.disabled = false; }
        }
    });

    // Botón para cancelar edición y botón de refresco.
    cancelButton.addEventListener('click', resetForm);
    document.getElementById('refresh-users').addEventListener('click', loadUsers);

    // Carga inicial de usuarios cuando se abre la vista.
    loadUsers();
});
