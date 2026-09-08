// Este archivo maneja el inicio de sesión del usuario.
// Valida credenciales y guarda la sesión en localStorage para usarla en otras páginas.
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    // Obtiene un nombre visible aunque el backend use un campo distinto.
    function getDisplayName(user) {
        return user?.nombreCompleto || user?.pnombre || user?.nombre || user?.email?.split('@')[0] || 'cliente';
    }

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Obtener los valores de los inputs.
        const correo = document.getElementById('correo').value.trim();
        const password = document.getElementById('password').value;

        // Acceso directo para administrador y vendedor de prueba.
        if (correo.toLowerCase() === 'admin@gmail.com' && password === 'rut') {
            const adminSession = {
                email: correo,
                pnombre: 'Administrador',
                rol: 'ADMIN'
            };
            localStorage.setItem('usuarioSesion', JSON.stringify(adminSession));
            window.location.href = 'admin.html';
            return;
        }

        if (correo.toLowerCase() === 'vendedor@gmail.com' && password === 'vendedor') {
            const sellerSession = {
                email: correo,
                pnombre: 'Vendedor',
                rol: 'VENDEDOR'
            };
            localStorage.setItem('usuarioSesion', JSON.stringify(sellerSession));
            window.location.href = 'adminProductos.html';
            return;
        }

        // 2. Estructura del login que espera el backend.
        const credentials = {
            email: correo,
            contrasena: password
        };

        try {
            // 3. Petición POST al endpoint de login.
            const response = await fetch('http://localhost:8080/api/clientes/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            // 4. Procesa la respuesta del backend.
            if (response.ok) {
                const cliente = await response.json();
                localStorage.setItem('usuarioSesion', JSON.stringify(cliente));

                alert(`¡Bienvenido/a, ${getDisplayName(cliente)}!`);

                const role = String(cliente.rol || cliente.role || '').toUpperCase();
                window.location.href = role === 'VENDEDOR' ? 'adminProductos.html' : role === 'ADMIN' ? 'admin.html' : 'index.html';
            } else {
                const errorMsg = await response.text();
                alert('No se pudo iniciar sesión: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error de red/servidor:', error);
            alert('Ocurrió un error al conectar con el servidor. Revisa si Spring Boot está activo.');
        }
    });
});