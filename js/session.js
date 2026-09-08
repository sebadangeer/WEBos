// Este archivo revisa si hay un usuario activo en localStorage y muestra el estado de sesión.
document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('usuarioSesion') || 'null');
    const loginItem = document.getElementById('nav-login-item');
    const userDropdown = document.getElementById('nav-user-dropdown');
    const welcome = document.getElementById('mensaje-bienvenida');
    const name = document.getElementById('nombre-usuario');
    const logout = document.getElementById('logout-btn');

    // Si hay usuario activo, oculta el botón de login y muestra el perfil.
    if (session) {
        loginItem?.classList.add('d-none');
        userDropdown?.classList.remove('d-none');
        welcome?.classList.remove('d-none');
        if (name) name.textContent = session.nombreCompleto || session.pnombre || session.nombre || session.email?.split('@')[0] || 'cliente';
    }

    // Botón de cierre de sesión.
    logout?.addEventListener('click', event => {
        event.preventDefault();
        localStorage.removeItem('usuarioSesion');
        window.location.reload();
    });
});
