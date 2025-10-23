document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // PARTE 1: LOGICA ARCHIVIO (Caricamento, Filtro, Visualizzazione)
    // =========================================

    const container = document.getElementById('archivio-container');
    const barraRicerca = document.getElementById('barra-ricerca');
    const filtroTono = document.getElementById('filtro-tono');
    let tuttiIProgetti = []; 

    function caricaDati() {
        fetch('progetti.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nel caricamento del file progetti.json');
                }
                return response.json();
            })
            .then(data => {
                tuttiIProgetti = data; 
                visualizzaProgetti(tuttiIProgetti); 
            })
            .catch(error => {
                console.error("Errore nel caricamento dell'archivio:", error);
                container.innerHTML = '<p class="errore">Impossibile caricare l\'archivio: Controlla il file progetti.json.</p>';
            });
    }

    function visualizzaProgetti(progettiDaMostrare) {
        container.innerHTML = ''; 
        
        if (progettiDaMostrare.length === 0) {
            container.innerHTML = '<p>Nessun progetto trovato che corrisponda ai criteri di ricerca/filtro.</p>';
            return;
        }

        progettiDaMostrare.forEach(progetto => {
            const card = document.createElement('div');
            card.className = 'progetto-card';
            card.innerHTML = `
                <a href="${progetto.link_fanzine}" target="_blank" title="Visualizza fanzine: ${progetto.titolo}">
                    <img src="${progetto.link_copertina}" alt="Copertina della fanzine ${progetto.titolo}" class="copertina-fanzine">
                </a>
                <h2>${progetto.titolo}</h2>
                <p><strong>ID:</strong> ${progetto.id}</p>
                <p><strong>Autore:</strong> ${progetto.autore}</p>
                <p><strong>Modulo:</strong> ${progetto.modulo_corso}</p>
                <p><strong>Tono:</strong> ${progetto.tono_voce}</p>
                <p><strong>Tema:</strong> ${progetto.tema}</p>
                <p><strong>Pagine:</strong> ${progetto.numero_pagine} (${progetto.anno})</p>
                <p><a href="${progetto.link_fanzine}" target="_blank">Download/Visualizza PDF</a></p>
            `;
            container.appendChild(card);
        });
    }

    function filtraEOrdinaProgetti() {
        const testoRicerca = barraRicerca.value.toLowerCase();
        const tonoSelezionato = filtroTono.value;

        const progettiFiltrati = tuttiIProgetti.filter(progetto => {
            const corrispondeRicerca = progetto.titolo.toLowerCase().includes(testoRicerca) ||
                                       progetto.autore.toLowerCase().includes(testoRicerca) ||
                                       progetto.tema.toLowerCase().includes(testoRicerca);
            
            const corrispondeTono = !tonoSelezionato || progetto.tono_voce === tonoSelezionato;

            return corrispondeRicerca && corrispondeTono;
        });

        visualizzaProgetti(progettiFiltrati);
    }

    barraRicerca.addEventListener('input', filtraEOrdinaProgetti);
    filtroTono.addEventListener('change', filtraEOrdinaProgetti);


    // =========================================
    // PARTE 2: PARTICLE SYSTEM (MASSIMA SEMPLIFICAZIONE)
    // =========================================

    let canvas, ctx;
    let particleColor;
    
    let particles = [];
    const numParticles = 200;
    const repulsionDistance = 150;
    const repulsionStrength = 0.6;
    const baseParticleSize = 8; 
    let sizeVariation = 0; // Controllata da ArrowUp/Down
    let variationRandomness = 0.5; // Controllata da ArrowLeft/Right

    let mouseX = null;
    let mouseY = null;

    const platonicSolids = [
        { name: 'tetrahedron', sides: 4 },
        { name: 'cube', sides: 6 },
        { name: 'octahedron', sides: 8 },
        { name: 'dodecahedron', sides: 12 },
        { name: 'icosahedron', sides: 20 },
    ];

    // ✅ FUNZIONE CRUCIALE: Inizializza il canvas e le variabili di contesto
    function setupCanvas() {
        canvas = document.getElementById('particleCanvas');
        if (!canvas) {
            console.error("Errore: Impossibile trovare il canvas (#particleCanvas) nel DOM. Controlla index.html.");
            return false;
        }

        ctx = canvas.getContext('2d');
        if (!ctx) {
             console.error("Errore: Impossibile ottenere il contesto 2D del canvas.");
             return false;
        }

        // Imposta le dimensioni iniziali
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Ottieni il colore Lime del CSS
        const computedStyle = getComputedStyle(document.documentElement);
        particleColor = computedStyle.getPropertyValue('--colore-accento').trim(); 
        
        if (!particleColor || particleColor.length < 4) {
             console.warn("Avviso: Colore CSS non letto correttamente. Uso fallback: #CCFF00.");
             particleColor = "#CCFF00"; // Fallback di emergenza
        }
        
        return true;
    }

    // Funzione per disegnare un poligono regolare
    function drawPolygon(ctx, x, y, radius, sides) {
        if (sides < 3) return;
        ctx.beginPath();
        const angleStep = (Math.PI * 2) / sides;
        let angle = -Math.PI / 2;
        ctx.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        for (let i = 1; i < sides; i++) {
            angle += angleStep;
            ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
    }

    // Classe Particella (SEMPLIFICATA)
    class Particle {
        constructor(x, y, color = particleColor, size = baseParticleSize) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            // Velocità più moderata per meno caos
            this.velocityX = (Math.random() * 0.6 - 0.3); 
            this.velocityY = (Math.random() * 0.6 - 0.3);
            this.maxVelocity = 2;
            this.friction = 0.98;
            this.baseVelocity = { x: this.velocityX, y: this.velocityY };
            this.wanderStrength = 0.05;
            this.shape = platonicSolids[Math.floor(Math.random() * platonicSolids.length)];
            this.targetSize = size;
        }

        update() {
            // Repulsione del mouse
            if (mouseX !== null && mouseY !== null) {
                let dx = this.x - mouseX;
                let dy = this.y - mouseY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < repulsionDistance) {
                    let force = (repulsionStrength * (repulsionDistance - distance)) / distance;
                    this.velocityX += dx * force;
                    this.velocityY += dy * force;

                    this.velocityX = Math.max(Math.min(this.velocityX, this.maxVelocity), -this.maxVelocity);
                    this.velocityY = Math.max(Math.min(this.velocityY, this.maxVelocity), -this.maxVelocity);
                }
            }

            // Movimento casuale/inerziale
            this.velocityX += (Math.random() - 0.5) * this.wanderStrength;
            this.velocityY += (Math.random() - 0.5) * this.wanderStrength;
            
            // Applica velocità e attrito
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;

            // Rimbalzo dai bordi (Versione più semplice)
            const damping = 0.7;
            if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                this.velocityX *= -damping;
            }
            if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                this.velocityY *= -damping;
            }
            this.x = Math.max(this.size, Math.min(this.x, canvas.width - this.size));
            this.y = Math.max(this.size, Math.min(this.y, canvas.height - this.size));


            // Dimensione dinamica
            const randomFactor = (Math.random() - 0.5) * variationRandomness * 2;
            this.targetSize = baseParticleSize + sizeVariation + randomFactor * 5; // Ridotta la scala di casualità
            this.size += (this.targetSize - this.size) * 0.1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 1; // Alpha sempre 1 per visibilità garantita
            drawPolygon(ctx, this.x, this.y, this.size, this.shape.sides);
        }
    }

    // Inizializza le particelle
    function initParticles() {
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
    }

    // Ciclo di animazione
    function animate() {
        if (!ctx) return; 

        // Rimuove la necessità di un alpha per lo sfondo
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        // Logica normale delle particelle
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        requestAnimationFrame(animate);
    }

    // Event listener per la posizione del mouse
    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouseX = null;
        mouseY = null;
    });

    // Event listener per il ridimensionamento della finestra
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }
    });

    // Event listener per la tastiera (dimensioni e casualità)
    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            sizeVariation = Math.min(sizeVariation + 1, 10);
        } else if (event.key === 'ArrowDown') {
            sizeVariation = Math.max(sizeVariation - 1, -5);
        } else if (event.key === 'ArrowLeft') {
            variationRandomness = Math.max(variationRandomness - 0.1, 0.1); 
        } else if (event.key === 'ArrowRight') {
            variationRandomness = Math.min(variationRandomness + 0.1, 1);
        }
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault(); // Impedisce lo scroll della pagina
        }
    });

    // =========================================
    // AVVIO
    // =========================================
    
    // 1. Inizializza il canvas (CRUCIALE)
    if (setupCanvas()) {
        // 2. Avvia le particelle solo se i canvas sono stati inizializzati con successo
        initParticles();
        // 3. Avvia l'animazione
        animate();
    }
    
    // 4. Avvia il caricamento dei dati dell'archivio
    caricaDati();

});
