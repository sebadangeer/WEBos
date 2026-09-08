document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get('id');
    const container = document.getElementById('blog-detail-content');

    if (!container) return;

    if (!blogId) {
        container.innerHTML = `
            <div class="error-box">
                <h3>Artículo no encontrado</h3>
                <p>No se recibió un identificador válido del blog.</p>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch('https://sneakersource.onrender.com/api/blogs');
        if (!response.ok) throw new Error('No se pudo obtener el contenido del blog');

        const blogs = await response.json();
        const blog = blogs.find(item => String(item.id_posteo) === String(blogId));

        if (!blog) {
            container.innerHTML = `
                <div class="error-box">
                    <h3>Artículo no encontrado</h3>
                    <p>El contenido solicitado no está disponible en este momento.</p>
                </div>
            `;
            return;
        }

        const image = blog.link_imagen_post || 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80';
        const content = blog.contenido_post || blog.descripcion_post || 'Contenido no disponible para este artículo.';

        document.title = `${blog.nombre_post} | Facture Sneakers`;

        container.innerHTML = `
            <article class="blog-detail-article">
                <a class="blog-back-link" href="blogs.html">← Volver a blogs</a>
                <div class="blog-detail-hero">
                    <img src="${image}" alt="${blog.nombre_post}">
                </div>

                <div class="blog-detail-body-copy">
                    <span class="news-meta">POST #${blog.id_posteo} • 5 MIN READ</span>
                    <h1 class="blog-detail-title">${blog.nombre_post}</h1>
                    <p class="blog-detail-summary">${blog.descripcion_post}</p>
                    <div class="blog-detail-content">
                        ${content
                            .split('\n')
                            .map(paragraph => `<p>${paragraph.trim() || '&nbsp;'}</p>`)
                            .join('')}
                    </div>
                </div>
            </article>
        `;
    } catch (error) {
        console.error('Error cargando blog:', error);
        container.innerHTML = `
            <div class="error-box">
                <h3>Error al cargar el artículo</h3>
                <p>Verifica que el backend de blogs esté activo y vuelve a intentarlo.</p>
            </div>
        `;
    }
});
