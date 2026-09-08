// Este archivo prepara el formulario de contacto para enviarse por Gmail.
// Reúne los datos del mensaje y los abre en una nueva ventana de correo.
document.getElementById('form-contacto')?.addEventListener('submit', event => {
    event.preventDefault();

    // Toma los datos del formulario.
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contenido = document.getElementById('contenido').value;

    // Prepara el asunto y el cuerpo del correo con los valores ingresados.
    const asunto = encodeURIComponent('Nuevo contacto desde Sneakers Store');
    const cuerpo = encodeURIComponent(`Nombre: ${nombre}\nCorreo de contacto: ${correo}\n\nMensaje:\n${contenido}`);

    // Abre una ventana con Gmail listo para enviar el mensaje.
    const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=se.balladares@duocuc.cl&su=${asunto}&body=${cuerpo}`;
    window.open(urlGmail, '_blank');
});
