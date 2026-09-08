IMPORTANTE!!
---------------------------------------------------------------------------------------------------------------------------------------------------------------
LINK DEL MICROSERVICIO (NECESARIO PARA EL MANEJO DE DATOS DE LA PAGINA WEB)
https://drive.google.com/file/d/1tqArJWbIQ91HmXkAjpZDZbVoHbB1RSAQ/view

---------------------------------------------------------------------------------------------------------------------------------------------------------------


# Facture Sneakers

Aplicacion web de comercio electronico para consultar y comprar zapatillas deportivas y urbanas. El proyecto ofrece catalogos de Nike Urban, Nike Sports y Jordan, registro e inicio de sesion, carrito de compras y paneles administrativos para gestionar productos y usuarios.

## Funcionalidades

### Clientes

- Navegacion por las secciones principales de la tienda.
- Consulta de productos por categoria:
  - Nike Urban.
  - Nike Sports.
  - Jordan.
- Visualizacion del detalle de cada producto.
- Seleccion de talla y cantidad segun el stock disponible.
- Registro de usuarios con datos personales y ubicacion.
- Seleccion de region y comuna de Chile.
- Inicio y cierre de sesion.
- Agregado de productos al carrito.
- Aumento, disminucion y eliminacion de productos del carrito.
- Vaciado completo del carrito.
- Calculo de subtotales y total general.
- Generacion de una boleta al completar la compra.

### Administracion

- Acceso restringido segun el rol guardado en la sesion.
- Gestion de productos para los roles `ADMIN` y `VENDEDOR`.
- Creacion, edicion y eliminacion de productos.
- Gestion de tallas y stock por producto.
- Avisos de stock critico.
- Gestion de usuarios para el rol `ADMIN`.
- Creacion, edicion y eliminacion de usuarios.
- Actualizacion de region y comuna de los usuarios.

## Tecnologias

- HTML5.
- CSS3.
- JavaScript.
- Bootstrap 5 mediante CDN.
- API HTTP con respuestas JSON.
- `localStorage` para conservar la sesion activa en el navegador.

## Estructura del proyecto

```text
Webos-1/
├── *.html                 Paginas de la aplicacion
├── css/                   Hojas de estilo externas
├── img/                   Imagenes, logos y recursos visuales
└── js/                    Logica e interaccion del frontend
```

### Paginas principales

| Pagina | Descripcion |
|---|---|
| `index.html` | Seleccion inicial de marcas y categorias. |
| `portada.html` | Portada de la tienda. |
| `catJordan.html` | Catalogo Jordan. |
| `catNikeSports.html` | Catalogo Nike Sports. |
| `catNikeUrban.html` | Catalogo Nike Urban. |
| `detalle.html` | Informacion detallada de un producto. |
| `acceso.html` | Acceso a inicio de sesion o registro. |
| `login.html` | Formulario de inicio de sesion. |
| `registro.html` | Formulario de registro de usuario. |
| `compra.html` | Seleccion de talla y cantidad. |
| `carrito.html` | Revision y gestion del carrito. |
| `comprartarjeta.html` | Vista relacionada con el proceso de pago. |
| `admin.html` | Panel principal de administracion. |
| `adminProductos.html` | CRUD de productos e inventario. |
| `adminUsuarios.html` | CRUD de usuarios. |
| `contacto.html` | Formulario de contacto. |
| `blogs.html` | Contenido informativo. |
| `nosotros.html` | Informacion de la tienda. |

### JavaScript principal

- `js/catalog.js`: carga productos y los filtra por categoria.
- `js/detalle.js`: consulta y muestra el detalle de un producto.
- `js/registro.js`: controla el registro de usuarios.
- `js/login.js`: controla el inicio de sesion.
- `js/session.js`: muestra el usuario activo y permite cerrar sesion.
- `js/compra.js`: valida talla, cantidad y agrega productos al carrito.
- `js/carrito.js`: consulta, actualiza, elimina y vacia el carrito; tambien genera la boleta.
- `js/adminProductos.js`: administra productos, tallas y stock.
- `js/adminUsuarios.js`: administra usuarios y sus datos.
- `js/ubicacionChile.js`: proporciona regiones y comunas de Chile.
- `js/navbar.js`: configura el estado y navegacion de la barra superior.

## Requisitos previos

- Navegador moderno con soporte para HTML5, CSS3, JavaScript y `localStorage`.
- Backend de la aplicacion ejecutandose en `http://localhost:8080`.
- API disponible y configurada con los endpoints esperados.
- Conexion a Internet para cargar Bootstrap desde CDN y cualquier recurso externo.

## Ejecucion

1. Clona o descarga el proyecto.
2. Inicia el backend en el puerto `8080`.
3. Abre el proyecto mediante un servidor local de archivos estaticos. Por ejemplo, usando la extension Live Server de VS Code.
4. Abre `portada.html` o `index.html` desde el servidor local.
5. Para probar el carrito y la administracion, inicia sesion con un usuario existente en el backend.

Tambien es posible abrir las paginas HTML directamente en el navegador para revisar la interfaz, pero las funciones que consultan la API requieren que el backend este activo y pueden verse limitadas por las politicas del navegador para archivos locales.

## API utilizada por el frontend

El frontend realiza solicitudes a rutas como las siguientes:

```text
GET    http://localhost:8080/api/productos
GET    http://localhost:8080/api/productos/categoria/{categoria}
GET    http://localhost:8080/api/clientes
POST   http://localhost:8080/api/clientes
PUT    http://localhost:8080/api/clientes/{id}
DELETE http://localhost:8080/api/clientes/{id}
GET    http://localhost:8080/api/clientes/{id}/carrito
POST   http://localhost:8080/api/clientes/{id}/carrito/items
PUT    http://localhost:8080/api/clientes/{id}/carrito/items/{productoId}
DELETE http://localhost:8080/api/clientes/{id}/carrito/items/{productoId}
POST   http://localhost:8080/api/clientes/{id}/boletas
```

Las rutas y los nombres de los campos deben coincidir con los contratos definidos por el backend. Si el servidor no esta disponible, el catalogo, el carrito y los paneles administrativos mostraran mensajes de error o no podran cargar informacion.

## Roles y acceso

- `ADMIN`: puede gestionar usuarios y productos.
- `VENDEDOR`: puede gestionar productos.
- Usuario registrado: puede utilizar el carrito y el proceso de compra.
- Cliente no autenticado: puede navegar y consultar el catalogo, pero debe iniciar sesion para agregar productos al carrito.

La interfaz usa `localStorage` para leer la sesion activa. La autorizacion definitiva debe ser validada por el backend en un entorno real.

## Validaciones

El proyecto utiliza validaciones HTML y JavaScript para:

- Campos obligatorios.
- Formatos de correo.
- Confirmacion de correo y contrasena.
- Rangos numericos de cantidades, precios y stock.
- Tallas disponibles y sin duplicados.
- Seleccion de region y comuna.
- Existencia de una sesion antes de usar el carrito.
- Limites de stock antes de actualizar cantidades.

Estas validaciones mejoran la experiencia de usuario, pero no reemplazan la validacion del servidor.

## Estilos y diseno

Los estilos se mantienen en hojas CSS externas organizadas por modulo. La identidad visual utiliza principalmente negro, blanco, grises y rojo como color de acento, en concordancia con una tienda de zapatillas deportivas y urbanas.

Los estilos principales se encuentran en:

- `css/styles.css`
- `css/navbar.css`
- `css/login.css`
- `css/registro.css`
- `css/carrito.css`
- `css/contacto.css`
- `css/adminCRUD.css`
- `css/detalle.css`

## Estado del proyecto

El frontend contiene las vistas y la logica de interaccion descritas en este documento. El funcionamiento completo de catalogos, usuarios, carrito, boletas y administracion depende de que exista un backend compatible en `http://localhost:8080`.

La integracion con una pasarela bancaria o el procesamiento real de tarjetas no se considera confirmado solo por la existencia de una pagina de pago; debe verificarse con el backend y el entorno de pruebas correspondiente.

## Trabajo colaborativo

El proyecto puede gestionarse mediante Git para organizar el trabajo del equipo, registrar cambios y sincronizar avances. Se recomienda mantener ramas por funcionalidad, realizar commits descriptivos y revisar los cambios antes de integrarlos a la rama principal.