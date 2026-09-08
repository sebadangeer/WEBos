// Este archivo cambia el fondo del cuerpo según la marca sobre la que el usuario pasa el mouse.
const cards = document.querySelectorAll('.brand-card');
const body = document.getElementById('page-body');

if (body) {
    // Fondo base negro para que la página se vea limpia antes del hover.
    body.style.backgroundImage = 'none';
    body.style.backgroundColor = '#050505';

    cards.forEach(card => {
        // Al entrar al área de una tarjeta, se coloca su imagen de fondo.
        card.addEventListener('mouseenter', () => {
            const background = card.getAttribute('data-bg');
            if (!background) return;
            body.style.backgroundImage = `url('${background}')`;
            body.style.backgroundSize = '280px';
            body.style.backgroundRepeat = 'repeat';
        });

        // Al salir, vuelve al fondo oscuro por defecto.
        card.addEventListener('mouseleave', () => {
            body.style.backgroundImage = 'none';
            body.style.backgroundColor = '#050505';
        });
    });
}