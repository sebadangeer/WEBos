// Este archivo carga la sección de blogs desde el backend y los dibuja en el HTML.
document.addEventListener('DOMContentLoaded', cargarBlogs);

// Trae los artículos desde la API de blogs y los renderiza en la vista.
async function cargarBlogs() {
    try {
        const response = await fetch('http://localhost:8080/api/blogs');
        if (!response.ok) throw new Error('Error en la respuesta');

        const blogs = await response.json();
        const container = document.getElementById('blogs-container');
        container.innerHTML = '';

        // Si no hay artículos, muestra un estado vacío.
        if (blogs.length === 0) {
            container.innerHTML = '<div class="empty-state"><h2>No hay artículos publicados</h2><p>El equipo editorial está preparando nuevo contenido.</p></div>';
            return;
        }

        // Genera una tarjeta por cada post del blog.
        blogs.forEach(blog => {
            const image = blog.link_imagen_post || 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80';
            container.innerHTML += `
                <article class="news-card">
                    <div class="news-image-wrapper"><img src="${image}" alt="${blog.nombre_post}" loading="lazy"><div class="news-category">LATEST DROP</div></div>
                    <div class="news-content">
                        <span class="news-meta">POST #${blog.id_posteo} &nbsp;•&nbsp; 5 MIN READ</span>
                        <h2 class="news-title">${blog.nombre_post}</h2>
                        <p class="news-excerpt">${blog.descripcion_post}</p>
                        <button class="news-btn" onclick="verPost(${blog.id_posteo})">LEER ARTÍCULO <span class="arrow">→</span></button>
                    </div>
                </article>`;
        });
    } catch (error) {
        console.error('Error al cargar:', error);
        document.getElementById('blogs-container').innerHTML = '<div class="error-box"><h3>Error de conexión</h3><p>No pudimos cargar los artículos. Verifica que el servidor esté activo.</p></div>';
    }
}

// Simula la apertura de un artículo. Más adelante podría redirigir a una vista completa.
function verPost(id) {
    alert('Accediendo al artículo de fondo. ID: ' + id);
}
