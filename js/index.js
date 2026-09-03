const cards = document.querySelectorAll('.brand-card');
const body = document.getElementById('page-body');
const defaultBackground = "url('img/logo/log4k.jpg')";

if (body) {
    body.style.backgroundImage = defaultBackground;
    body.style.backgroundSize = '680px';
    body.style.backgroundRepeat = 'repeat';

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const background = card.getAttribute('data-bg');
            if (!background) return;
            body.style.backgroundImage = `url('${background}')`;
            body.style.backgroundSize = '280px';
            body.style.backgroundRepeat = 'repeat';
        });
        card.addEventListener('mouseleave', () => {
            body.style.backgroundImage = defaultBackground;
            body.style.backgroundSize = '280px';
            body.style.backgroundRepeat = 'repeat';
        });
    });
}
