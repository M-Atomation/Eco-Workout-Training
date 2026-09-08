/**
 * script.js - EcoWorkout CV Digital
 * Funcionalidades: menú hamburguesa, precios desde Google Sheets (CSV),
 * carrusel de competencias (responsivo/táctil) y gestión de la línea de tiempo.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ================================================================
    // 1. MENÚ HAMBURGUESA
    // ================================================================
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
            const icon = this.querySelector('i');
            icon.className = mainNav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
        });

        document.querySelectorAll('.header-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }

    // ================================================================
    // 2. LÍNEA DE TIEMPO (híbrida: horizontal + vertical)
    // ================================================================
    const experienciaData = [
        { cargo: 'Instructora de gimnasio', empresa: 'Ecos del deporte', fecha: 'Mar 2026 – Jun 2026' },
        { cargo: 'Instructora de gimnasio', empresa: 'Colsubsidio', fecha: 'May 2023 – Ene 2026' },
        { cargo: 'Instructora · SERO', empresa: 'Servicios Ocasionales', fecha: 'Oct 2022 – May 2023' },
        { cargo: 'Instructora y Salvavidas', empresa: 'CEDA', fecha: 'Jun 2022 – Sep 2022' },
        { cargo: 'Instructora de gimnasio', empresa: 'INCAP S.A.S', fecha: 'Oct 2021 – Dic 2021' },
        { cargo: 'Instructora de gimnasio', empresa: 'Colsubsidio', fecha: 'Jun 2019 – Jul 2020' },
        { cargo: 'Instructora de gimnasio', empresa: 'ATLANTIC POOLS INC.', fecha: 'Mar 2019 – Abr 2019' }
        ];

    /**
     * Renderiza la línea de tiempo en el DOM.
     * @param {Array} data - Arreglo de objetos con la experiencia laboral.
     */
    function renderTimeline(data) {
        const containerH = document.getElementById('timelineHorizontal');
        const containerV = document.getElementById('timelineVertical');

        if (!containerH || !containerV) return;

        let htmlH = '';
        let htmlV = '';

        data.forEach(item => {
            htmlH += `
                <div class="timeline-h-item">
                    <div class="timeline-h-marker"></div>
                    <div class="timeline-h-content">
                        <h3>${item.cargo}</h3>
                        <span class="company">${item.empresa}</span>
                        <span class="timeline-h-date">${item.fecha}</span>
                    </div>
                </div>
            `;

            htmlV += `
                <div class="timeline-v-item">
                    <div class="timeline-v-marker"></div>
                    <div class="timeline-v-content">
                        <h3>${item.cargo}</h3>
                        <span class="company">${item.empresa}</span>
                        <span class="timeline-v-date">${item.fecha}</span>
                    </div>
                </div>
            `;
        });

        containerH.innerHTML = htmlH;
        containerV.innerHTML = htmlV;
    }

    renderTimeline(experienciaData);

    // ================================================================
    // 3. PRECIOS DESDE GOOGLE SHEETS (CSV)
    // ================================================================
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN13ajUpkzJ5rQWFOcS9XNWm3vxNA5wlwVTrapwFiHzW3SJaCemdjrRec-rjB2a6u2Rq1HtFLdQmxT/pub?output=csv&gid=1546839515&single=true';
    const pricingContainer = document.getElementById('pricing-container');

    if (pricingContainer) {
        pricingContainer.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Cargando planes...</div>`;

        /**
         * Parsea el texto CSV a un arreglo de objetos.
         * @param {string} csvText - Texto en formato CSV.
         * @returns {Array} Arreglo de objetos parseados.
         */
        function parseCSV(csvText) {
            // 1. Limpiamos espacios al inicio/final y separamos por saltos de línea (Windows/Mac/Linux)
            const lines = csvText.trim().split(/\r?\n/);
            
            if (lines.length < 2) return [];
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const result = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const row = [];
                let current = '';
                let insideQuotes = false;
                
                for (let char of lines[i]) {
                    if (char === '"') {
                        insideQuotes = !insideQuotes;
                    } else if (char === ',' && !insideQuotes) {
                        row.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                row.push(current.trim());
                
                // Aseguramos que la fila tenga la misma cantidad de columnas que las cabeceras
                if (row.length === headers.length) {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index] ? row[index].replace(/^"|"$/g, '') : '';
                    });
                    result.push(obj);
                }
            }
            return result;
        }

        /**
         * Renderiza las tarjetas de precios en el DOM.
         * @param {Array} data - Datos parseados del CSV.
         */
        function renderPricingFromCSV(data) {
            if (!data || data.length === 0) {
                pricingContainer.innerHTML = '<p style="color: #4a6a4a;">No hay planes disponibles. Contáctame directamente.</p>';
                return;
            }
            
            let html = '';
            data.forEach(row => {
                const keys = Object.keys(row);
                const plan = row[keys[0]] || 'Plan';
                const precio = row[keys[1]] || '';
                const desc = row[keys[2]] || '';
                
                html += `
                    <div class="pricing-card">
                        <h4>${plan}</h4>
                        <div class="price">${precio}</div>
                        ${desc ? `<div class="desc">${desc}</div>` : ''}
                    </div>
                `;
            });
            pricingContainer.innerHTML = html || '<p style="color: #4a6a4a;">No se encontraron datos.</p>';
        }

        fetch(CSV_URL)
            .then(response => {
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                return response.text();
            })
            .then(csvText => {
                const data = parseCSV(csvText);
                renderPricingFromCSV(data);
            })
            .catch(error => {
                console.error('Error cargando precios:', error);
                pricingContainer.innerHTML = `
                    <div style="background:#fce4ec; padding:1rem; border-radius:12px; border-left:4px solid #c62828;">
                        <strong>⚠️ No se pudieron cargar los precios.</strong><br>
                        Verifica que tu hoja esté publicada correctamente.<br>
                        <small style="color:#666;">Error: ${error.message}</small>
                    </div>
                `;
            });
    }

    // ================================================================
    // 4. CARRUSEL DE COMPETENCIAS (RESPONSIVO Y TÁCTIL)
    // ================================================================
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    if (track && prevBtn && nextBtn && dotsContainer) {
        const competenciasData = [
            { nombre: 'Corre como el viento (FAC)', img: 'assets/competitions/corre-viento.jpg' },
            { nombre: 'Carrera por la Policía', img: 'assets/competitions/carrera-policia.jpg' },
            { nombre: 'Batalla de Ayacucho dos siglos de Gloria', img: 'assets/competitions/batalla-ayacucho.jpg' },
            { nombre: 'Bimbo global Racer', img: 'assets/competitions/bimbo-global.jpg' },
            { nombre: 'Primer Festival de Cross Country MTB', img: 'assets/competitions/festival-cross.jpg' },
            { nombre: 'Campeonato distrital', img: 'assets/competitions/campeonato-distrital.jpg' },
            { nombre: 'Ruta Fucsia Colombina (Parceros MTB/Ruta)', img: 'assets/competitions/ruta-fucsia.jpg' },
            { nombre: 'MMB 10K', img: 'assets/competitions/mmb10k.jpg' },
            { nombre: 'NatGeo 10K', img: 'assets/competitions/natgeo10k.jpg' },
            { nombre: 'Carrera de la Mujer 10K', img: 'assets/competitions/mujer10k.jpg' },
            { nombre: 'Carrera verde', img: 'assets/competitions/carrera-verde.jpg' }
        ];

        let itemsPerSlide = getItemsPerSlide();
        let currentIndex = 0;
        let slides = [];
        let autoPlayInterval = null;

        /**
         * Determina el número de items a mostrar por slide según el viewport.
         * @returns {number} Cantidad de items.
         */
        function getItemsPerSlide() {
            if (window.innerWidth <= 600) return 1;  
            if (window.innerWidth <= 850) return 2;  
            return 3;                                 
        }

        /**
         * Construye los arreglos de datos segmentados por slide.
         * @returns {Array} Array de arrays con los items por vista.
         */
        function buildSlides() {
            const perSlide = getItemsPerSlide();
            const groups = [];
            for (let i = 0; i < competenciasData.length; i += perSlide) {
                groups.push(competenciasData.slice(i, i + perSlide));
            }
            return groups;
        }

        /**
         * Genera el DOM del carrusel y los indicadores de posición (dots).
         */
        function renderCarousel() {
            slides = buildSlides();
            track.innerHTML = '';
            dotsContainer.innerHTML = '';

            if (slides.length === 0) {
                track.innerHTML = '<p style="padding:1rem; text-align:center; color:#4a6a4a;">No hay competencias para mostrar.</p>';
                return;
            }

            // Construir UI de las tarjetas
            slides.forEach((group) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'carousel-slide';

                group.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'competencia-card';

                    const img = document.createElement('img');
                    img.src = item.img;
                    img.alt = item.nombre;
                    img.loading = 'lazy'; // Optimización de carga de recursos
                    
                    // Fallback en caso de que la imagen no exista
                    img.onerror = function () {
                        this.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'no-img';
                        fallback.innerHTML = '<i class="fas fa-running"></i>';
                        card.insertBefore(fallback, this);
                    };

                    const title = document.createElement('span');
                    title.className = 'slide-title';
                    title.textContent = item.nombre;

                    card.appendChild(img);
                    card.appendChild(title);
                    slideDiv.appendChild(card);
                });

                track.appendChild(slideDiv);
            });

            // Construir UI de los Dots con atributos de accesibilidad
            for (let i = 0; i < slides.length; i++) {
                const dot = document.createElement('button');
                dot.className = 'dot';
                dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
                if (i === 0) dot.classList.add('active');
                dot.dataset.index = i;
                
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoPlay();
                });
                
                dotsContainer.appendChild(dot);
            }

            // Validar que el index no quede fuera de rango al redimensionar
            if (currentIndex >= slides.length) currentIndex = Math.max(0, slides.length - 1);
            updateCarousel();
        }

        /**
         * Aplica la transformación CSS para desplazar el track del carrusel.
         */
        function updateCarousel() {
            if (slides.length === 0) return;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            document.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;
            updateCarousel();
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        // Eventos botones de navegación
        prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
        nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });

        // Control de Autoplay
        function startAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            if (slides.length > 1) {
                autoPlayInterval = setInterval(nextSlide, 4000);
            }
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        // Eventos táctiles para móviles (Swipe UX)
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoPlay();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50; // Pixeles mínimos para considerar un "deslizamiento"
            if (touchEndX < touchStartX - swipeThreshold) nextSlide();
            if (touchEndX > touchStartX + swipeThreshold) prevSlide();
        }

        // Pausar autoplay al hacer hover (Desktop)
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoPlay);
            carouselContainer.addEventListener('mouseleave', startAutoPlay);
        }

        // Inicializar
        renderCarousel();
        startAutoPlay();

        // Control responsivo al redimensionar ventana (Debounce optimizado)
        let resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newItemsPerSlide = getItemsPerSlide();
                if (newItemsPerSlide !== itemsPerSlide) {
                    const currentItemAbsoluteIndex = currentIndex * itemsPerSlide;
                    itemsPerSlide = newItemsPerSlide;
                    renderCarousel();
                    // Calcular el nuevo index para que el usuario no pierda el contexto
                    const newIndex = Math.min(Math.floor(currentItemAbsoluteIndex / itemsPerSlide), slides.length - 1);
                    goToSlide(newIndex);
                }
            }, 250);
        });
    }

    // ================================================================
    // 5. ACTUALIZAR AÑO
    // ================================================================
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }

    // ================================================================
    // 6. BOTÓN VOLVER ARRIBA
    // ================================================================
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
