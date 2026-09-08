        const ubicacionChile = window.ubicacionChile || { regiones: [] };

        const regionesData = ubicacionChile.regiones.map(region => ({
            id: region.id,
            nombre: region.nombre
        }));

        const comunasPorRegion = Object.fromEntries(
            ubicacionChile.regiones.map(region => [region.id, region.comunas])
        );

        // Referencias a los elementos del formulario y de los menús desplegables.
        const btnRegion = document.getElementById('btn-region');
        const menuRegion = document.getElementById('menu-region');
        const inputRegion = document.getElementById('region');

        const btnComuna = document.getElementById('btn-comuna');
        const menuComuna = document.getElementById('menu-comuna');
        const inputComuna = document.getElementById('comuna');

        // Al cargar la página, se agregan todas las regiones al menú.
        regionesData.forEach(r => {
            const item = document.createElement('div');
            item.className = 'custom-option';
            item.textContent = r.nombre;
            item.addEventListener('click', () => seleccionarRegion(r));
            menuRegion.appendChild(item);
        });

        // Cuando se hace clic en el botón de región, se abre o cierra el menú.
        btnRegion.addEventListener('click', (e) => {
            e.stopPropagation();
            menuComuna.classList.remove('show');
            menuRegion.classList.toggle('show');
        });

        // Cuando se hace clic en el botón de comuna, se abre o cierra el menú.
        btnComuna.addEventListener('click', (e) => {
            e.stopPropagation();
            menuRegion.classList.remove('show');
            menuComuna.classList.toggle('show');
        });

        // Guarda la región seleccionada y carga sus comunas correspondientes.
        function seleccionarRegion(region) {
            btnRegion.textContent = region.nombre;
            inputRegion.value = region.id;
            menuRegion.classList.remove('show');

            btnComuna.textContent = '-- Seleccione la comuna --';
            btnComuna.disabled = false;
            inputComuna.value = '';
            menuComuna.innerHTML = '';

            // Si la región existe en el diccionario, se rellenan sus comunas.
            if (comunasPorRegion[region.id]) {
                comunasPorRegion[region.id].forEach(comuna => {
                    const item = document.createElement('div');
                    item.className = 'custom-option';
                    item.textContent = comuna;
                    item.addEventListener('click', () => seleccionarComuna(comuna));
                    menuComuna.appendChild(item);
                });
            }
        }

        // Guarda la comuna seleccionada y la convierte a un formato útil para enviar.
        function seleccionarComuna(comuna) {
            btnComuna.textContent = comuna;
            inputComuna.value = comuna.toLowerCase().replace(/\s+/g, '-');
            menuComuna.classList.remove('show');
        }

        // Si el usuario hace clic fuera, se cierran los menús desplegables.
        document.addEventListener('click', () => {
            menuRegion.classList.remove('show');
            menuComuna.classList.remove('show');
        });

        // Cuando se envía el formulario, se validan los datos y luego se envían al backend.
        document.getElementById('form-registro').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Captura de datos desde el formulario.
            const nombreCompleto = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const confirmarCorreo = document.getElementById('confirmar-correo').value.trim();
            const password = document.getElementById('password').value;
            const confirmarPassword = document.getElementById('confirmar-password').value;
            const telefono = document.getElementById('telefono').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const region = document.getElementById('region').value;
            const comuna = document.getElementById('comuna').value;

            // Solo acepta correos con dominios permitidos.
            const dominiosPermitidos = /^[a-zA-Z0-9._%+-]+@(gmail\.com|duocuc\.cl|profesorduoc\.cl)$/i;

            if (!dominiosPermitidos.test(correo)) {
                alert('El correo debe pertenecer a uno de los siguientes dominios: @gmail.com, @duocuc.cl o @profesorduoc.cl');
                return;
            }

            // Validaciones del cliente antes de enviar.
            if (correo !== confirmarCorreo) {
                alert('Los correos electrónicos no coinciden.');
                return;
            }

            if (password !== confirmarPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            if (password.length > 10) {
                alert('La contraseña no puede exceder los 10 caracteres.');
                return;
            }

            if (!direccion) {
                alert('Debes ingresar una dirección.');
                return;
            }

            if (!region || !comuna) {
                alert('Debes seleccionar una región y una comuna.');
                return;
            }

            // Estructura del cliente que el backend espera recibir.
            const nuevoCliente = {
                nombreCompleto,
                email: correo,
                contrasena: password,
                numero: telefono,
                direccion: direccion,
                region: region,
                comuna: comuna
            };

            try {
                // Se envia la información al servidor mediante una petición POST.
                const response = await fetch('http://localhost:8080/api/clientes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nuevoCliente)
                });

                // Si la respuesta fue exitosa, se redirige al login.
                if (response.ok) {
                    alert('¡Registro exitoso! Redirigiendo al inicio de sesión...');
                    window.location.href = 'login.html';
                } else {
                    // Si el backend respondió con error, se muestra el mensaje del servidor.
                    const errorMsg = await response.text();
                    alert('Error al registrar el cliente: ' + errorMsg);
                }
            } catch (error) {
                // Si hay un error de conexión o del servidor, se avisa al usuario.
                console.error('Error de red/servidor:', error);
                alert('Ocurrió un error al conectar con el servidor.');
            }
        });