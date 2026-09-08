/**
 * script.js - EcoWorkout CV Digital
 * Funcionalidades: menú hamburguesa, precios desde Google Sheets (CSV) y carrusel de competencias.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ================================================================
    // 1. MENÚ HAMBURGUESA
    // ================================================================
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    menuToggle.addEventListener('click', function () {
        mainNav.classList.toggle('open');
        const icon = this.querySelector('i');
        icon.className = mainNav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });

    document.querySelectorAll('.header-nav a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            menuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    // ================================================================
    // 2. PRECIOS DESDE GOOGLE SHEETS (VÍA CSV PÚBLICO)
    // ================================================================

    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN13ajUpkzJ5rQWFOcS9XNWm3vxNA5wlwVTrapwFiHzW3SJaCemdjrRec-rjB2a6u2Rq1HtFLdQmxT/pub?output=csv&gid=1546839515&single=true';

    const pricingContainer = document.getElementById('pricing-container');

    pricingContainer.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Cargando planes...</div>`;

    function parseCSV(csvText) {
        const lines = csvText.split('\n');
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
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
                    Verifica que tu hoja esté publicada (Archivo > Compartir > Publicar en la web).<br>
                    <small style="color:#666;">Error: ${error.message}</small>
                </div>
            `;
        });

    // ================================================================
    // 3. CARRUSEL DE COMPETENCIAS
    // ================================================================
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    const competenciasData = [
        { nombre: 'Corre como el viento (FAC)', img: 'assets/competitions/corre-viento.svg' },
        { nombre: 'Carrera por la Policía', img: 'assets/competitions/carrera-policia.svg' },
        { nombre: 'Batalla de Ayacucho dos siglos de Gloria', img: 'assets/competitions/batalla-ayacucho.svg' },
        { nombre: 'Bimbo global Racer', img: 'assets/competitions/bimbo-global.svg' },
        { nombre: 'Primer Festival de Cross Country MTB', img: 'assets/competitions/festival-cross.svg' },
        { nombre: 'Campeonato distrital', img: 'assets/competitions/campeonato-distrital.svg' },
        { nombre: 'Ruta Fucsia Colombina (Parceros MTB/Ruta)', img: 'assets/competitions/ruta-fucsia.svg' },
        { nombre: 'MMB 10K', img: 'assets/competitions/mmb10k.svg' },
        { nombre: 'NatGeo 10K', img: 'assets/competitions/natgeo10k.svg' },
        { nombre: 'Carrera de la Mujer 10K', img: 'assets/competitions/mujer10k.svg' },
        { nombre: 'Carrera verde', img: 'assets/competitions/carrera-verde.svg' }
    ];

    const ITEMS_PER_SLIDE = 3;
    let currentIndex = 0;
    let slides = [];

    function buildSlides() {
        const groups = [];
        for (let i = 0; i < competenciasData.length; i += ITEMS_PER_SLIDE) {
            groups.push(competenciasData.slice(i, i + ITEMS_PER_SLIDE));
        }
        return groups;
    }

    function renderCarousel() {
        slides = buildSlides();
        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        if (slides.length === 0) {
            track.innerHTML = '<p style="padding:1rem; text-align:center; color:#4a6a4a;">No hay competencias para mostrar.</p>';
            return;
        }

        slides.forEach((group) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'carousel-slide';

            group.forEach(item => {
                const card = document.createElement('div');
                card.className = 'competencia-card';

                const img = document.createElement('img');
                img.src = item.img;
                img.alt = item.nombre;
                img.loading = 'lazy';
                img.onerror = function() {
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

        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        updateCarousel();
    }

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

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    let autoPlayInterval = null;
    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 3500);
    }
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);
    carouselContainer.addEventListener('touchstart', stopAutoPlay);
    carouselContainer.addEventListener('touchend', startAutoPlay);

    renderCarousel();
    startAutoPlay();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel();
        }, 150);
    });
});

// ================================================================
// 4. ACTUALIZAR AÑO AUTOMÁTICAMENTE EN EL FOOTER
// ================================================================
(function() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }
})();
