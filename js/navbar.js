// Este archivo crea y configura la barra de navegación del sitio.
// Ajusta los enlaces según el rol del usuario y la página en la que está.
document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('usuarioSesion') || 'null');
    const role = String(session?.rol || session?.role || '').toUpperCase();
    const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'portada.html';
    const adminPages = ['admin.html', 'adminproductos.html', 'adminusuarios.html'];
    const isAdminPage = adminPages.includes(currentPage);

    // Si intenta entrar a una página de administración sin permisos, se redirige.
    if (isAdminPage && role !== 'ADMIN' && !(role === 'VENDEDOR' && currentPage === 'adminproductos.html')) {
        window.location.replace(role === 'VENDEDOR' ? 'adminProductos.html' : 'acceso.html');
        return;
    }

    // Elimina navs duplicados y genera uno según el tipo de vista.
    document.querySelectorAll('body > nav, body > .top-navbar, body > .nav-container').forEach(element => element.remove());
    const isAdminNavbar = document.body.dataset.navbar === 'admin';

    document.body.insertAdjacentHTML('afterbegin', `
        <nav id="site-navbar" class="site-navbar">
            <div class="site-navbar-inner">
                <a class="site-navbar-brand" href="index.html">
                    <img src="img/logo/logoFinal.jpg" alt="Facture Sneakers">
                </a>
                <button class="site-navbar-toggle" type="button" aria-controls="site-navbar-menu" aria-expanded="false" aria-label="Abrir menú">
                    <span></span><span></span><span></span>
                </button>
                <div id="site-navbar-menu" class="site-navbar-menu">
                    ${isAdminNavbar ? `
                        ${role === 'ADMIN' ? '<a href="adminUsuarios.html">Gestionar clientes</a>' : ''}
                        <a href="adminProductos.html">Gestionar productos</a>
                        <a href="index.html" id="logout-btn">Cerrar sesión</a>
                    ` : `
                        <a href="portada.html">Inicio</a>
                        <a href="index.html">Productos</a>
                        <a href="nosotros.html">Nosotros</a>
                        <a href="blogs.html">Blogs</a>
                        <a href="contacto.html">Contacto</a>
                        <a href="acceso.html" id="nav-login-item">Iniciar Sesión</a>
                        <div class="site-navbar-account d-none" id="nav-user-dropdown">
                            <button type="button" id="account-toggle" aria-expanded="false">Mi Cuenta</button>
                            <div class="site-navbar-account-menu">
                                <a href="#">Perfil</a>
                                <a href="#" id="logout-btn">Cerrar Sesión</a>
                            </div>
                        </div>
                        <a class="site-navbar-cart" href="carrito.html">Carrito (<span id="cart-count">0</span>)</a>
                    `}
                </div>
            </div>
        </nav>
    `);

    // Marca la opción activa en el menú según la página corriente.
    if (isAdminNavbar) {
        const adminPage = window.location.pathname.split('/').pop().toLowerCase();
        document.querySelectorAll('#site-navbar-menu > a').forEach(link => {
            const linkPage = link.getAttribute('href')?.split('#')[0].toLowerCase();
            if (linkPage === adminPage) link.classList.add('active');
        });
    }

    const activePage = currentPage === 'carrito.html'
        ? 'carrito.html'
        : currentPage === 'blogs.html'
        ? 'blogs.html'
        : currentPage === 'nosotros.html'
            ? 'nosotros.html'
            : currentPage === 'contacto.html'
                ? 'contacto.html'
                : ['acceso.html', 'login.html', 'registro.html'].includes(currentPage)
                    ? 'acceso.html'
                    : ['compra.html', 'carrito.html', 'comprartarjeta.html'].includes(currentPage)
                        ? 'compra.html'
                        : ['index.html', 'listarproductos.html', 'detalle.html', 'catjordan.html', 'catnikesports.html', 'catnikeurban.html', 'jordan.html', 'nike.html', 'nike.sports.html'].includes(currentPage)
                            ? 'index.html'
                            : 'portada.html';

    document.querySelectorAll('#site-navbar-menu > a').forEach(link => {
        if (link.getAttribute('href') === activePage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Abre y cierra el menú móvil.
    const toggle = document.querySelector('.site-navbar-toggle');
    const menu = document.getElementById('site-navbar-menu');
    toggle?.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('is-open', !expanded);
    });

    // Muestra u oculta las opciones de cuenta del usuario.
    const accountToggle = document.getElementById('account-toggle');
    accountToggle?.addEventListener('click', () => {
        const account = document.getElementById('nav-user-dropdown');
        account.classList.toggle('is-open');
        accountToggle.setAttribute('aria-expanded', String(account.classList.contains('is-open')));
    });

    // Si hay usuario activo, muestra el estado de sesión.
    const hasActiveSession = Boolean(session);
    if (hasActiveSession) {
        document.getElementById('nav-login-item')?.classList.add('d-none');
        document.getElementById('nav-user-dropdown')?.classList.remove('d-none');
    }

    // Cierra sesión y redirige según el contexto.
    document.getElementById('logout-btn')?.addEventListener('click', event => {
        event.preventDefault();
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('usuarioSesion');
        window.location.href = isAdminNavbar ? 'index.html' : window.location.href;
    });

    // Obtiene la cantidad de productos del carrito y la muestra en el navbar.
    if (session?.id) {
        fetch(`https://sneakersource.onrender.com/api/clientes/${session.id}/carrito`)
            .then(response => response.ok ? response.json() : null)
            .then(cart => {
                const count = (cart?.items || []).reduce((total, item) => total + Number(item.cantidad || 0), 0);
                const cartCount = document.getElementById('cart-count');
                if (cartCount) cartCount.textContent = count;
            })
            .catch(() => {});
    }
});
