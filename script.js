document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // PARTE 1: LOGICA ARCHIVIO (Caricamento, Filtro, Visualizzazione)
    // =========================================

    const container = document.getElementById('archivio-container');
    const barraRicerca = document.getElementById('barra-ricerca');
    const filtroTono = document.getElementById('filtro-tono');
    let tuttiIProgetti = []; 

    // Funzione 1: Carica i dati dal JSON
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

    // Funzione 2: Crea e visualizza le schede dei progetti
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

    // Funzione 3: Applica Filtro e Ricerca
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

    // Listener per attivare il filtro
    barraRicerca.addEventListener('input', filtraEOrdinaProgetti);
    filtroTono.addEventListener('change', filtraEOrdinaProgetti);

    // =========================================
    // PARTE 2: PARTICLE SYSTEM (RIVISTA E CORRETTA)
    // =========================================

    let canvas, ctx, textCanvas, textCtx;
    let particleColor;
    
    let particles = [];
    const numParticles = 200;
    const repulsionDistance = 150;
    const repulsionStrength = 0.6;
    const baseParticleSize = 8; // Rinominata per chiarezza
    let sizeVariation = 0;
    let variationRandomness = 0.5;

    let mouseX = null;
    let mouseY = null;
    let activeText = '';
    let textParticles = [];
    let disintegrationFactor = 0;
    let phraseDisplayTimeout;
    let textDisplayDuration = 4000; 

    const platonicSolids = [
        { name: 'tetrahedron', sides: 4 },
        { name: 'cube', sides: 6 },
        { name: 'octahedron', sides: 8 },
        { name: 'dodecahedron', sides: 12 },
        { name: 'icosahedron', sides: 20 },
    ];

    const inklusivaPhrases = [
        "INGENUINITÀ > INGEGNO ETICO",
        "LEGACY DIGITALE 4.0",
        "SCARTO ETICO",
        "ARTEFATTO IBRIDO",
        "LA VOCE COERENTE",
        "SELF-PUBLISHING SOSTENIBILE",
        "DESIGN COME PREVENZIONE",
        "METODOLOGIA IBRIDA PI KOBOSE",
        "ACCESSORIETÀ MASSIMA",
        "CITTADINANZA ATTIVA"
    ];

    // ✅ FUNZIONE CRUCIALE: Inizializza il canvas e le variabili di contesto
    function setupCanvas() {
        canvas = document.getElementById('particleCanvas');
        textCanvas = document.getElementById('textCanvas');

        if (!canvas || !textCanvas) {
            console.error("Errore: Impossibile trovare i canvas nel DOM. Controlla index.html.");
            return false;
        }

        ctx = canvas.getContext('2d');
        textCtx = textCanvas.getContext('2d');

        // Imposta le dimensioni iniziali
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        textCanvas.width = window.innerWidth;
        textCanvas.height = window.innerHeight;

        // ✅ Ottieni il colore Lime del CSS
        const computedStyle = getComputedStyle(document.documentElement);
        particleColor = computedStyle.getPropertyValue('--colore-accento'); 
        
        if (!particleColor || particleColor.length < 4) {
             console.warn("Avviso: Colore CSS non letto correttamente. Uso fallback: #CCFF00.");
             particleColor = "#CCFF00"; // Fallback
        } else {
             particleColor = particleColor.trim();
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

    // Classe Particella
    class Particle {
        constructor(x, y, color = particleColor, size = baseParticleSize) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            // Velocità iniziale randomizzata leggermente più lenta per stabilità
            this.velocityX = (Math.random() * 0.8 - 0.4); 
            this.velocityY = (Math.random() * 0.8 - 0.4);
            this.alpha = 0;
            this.fadeSpeed = 0.01;
            this.maxVelocity = 2;
            this.friction = 0.98;
            this.baseVelocity = { x: this.velocityX, y: this.velocityY };
            this.wanderStrength = 0.05;
            this.shape = platonicSolids[Math.floor(Math.random() * platonicSolids.length)];
            this.targetSize = size;
        }

        update() {
            if (this.alpha < 1) {
                this.alpha += this.fadeSpeed;
            }

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
            this.velocityX += (this.baseVelocity.x - this.velocityX) * 0.005;
            this.velocityY += (this.baseVelocity.y - this.velocityY) * 0.005;

            // Applica velocità e attrito
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;

            // Rimbalzo dai bordi
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
            this.targetSize = baseParticleSize + sizeVariation + randomFactor * 10;
            this.size += (this.targetSize - this.size) * 0.1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            drawPolygon(ctx, this.x, this.y, this.size, this.shape.sides);
            ctx.globalAlpha = 1;
        }
    }

    // Inizializza le particelle
    function initParticles() {
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            // Posiziona le particelle in modo casuale entro i limiti
            particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
    }

    // Crea le particelle del testo per l'effetto di disintegrazione
    function createTextParticles(text, x, y) {
        textParticles = [];
        const fontSize = 38; 
        textCtx.font = `700 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`; 
        textCtx.fillStyle = particleColor; 
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        textCtx.fillText(text, x, y);

        // Prende i dati del pixel del testo disegnato
        const textData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height); // Pulisci il canvas di testo immediatamente

        // Campionamento dei pixel colorati per creare particelle
        for (let i = 0; i < textCanvas.width; i += 4) {
            for (let j = 0; j < textCanvas.height; j += 4) {
                const pixelAlpha = textData[(j * textCanvas.width + i) * 4 + 3];
                if (pixelAlpha > 128) {
                    textParticles.push(new Particle(i, j, particleColor, 2));
                }
            }
        }
    }
    
    // Disegna il testo statico quando non c'è disintegrazione
    function drawText() {
        if (activeText && textParticles.length === 0) {
            const fontSize = 38;
            textCtx.globalAlpha = 1;
            textCtx.font = `700 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
            textCtx.fillStyle = particleColor; 
            textCtx.textAlign = 'center';
            textCtx.textBaseline = 'middle';
            textCtx.fillText(activeText, textCanvas.width / 2, textCanvas.height / 2);
            textCtx.globalAlpha = 1;
        }
    }

    // Ciclo di animazione
    function animate() {
        if (!ctx || !textCtx) {
            // Se i contesti non sono definiti, ferma l'animazione o riprova
            return; 
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height); 

        if (textParticles.length > 0) {
            // Logica di disintegrazione del testo
            disintegrationFactor += 0.003; 
            if (disintegrationFactor >= 1) {
                textParticles = [];
                disintegrationFactor = 0;
                activeText = '';
            }

            for (let i = 0; i < textParticles.length; i++) {
                textParticles[i].x += textParticles[i].velocityX * (1 + disintegrationFactor * 6); 
                textParticles[i].y += textParticles[i].velocityY * (1 + disintegrationFactor * 6);
                textParticles[i].alpha = Math.max(0, 1 - disintegrationFactor * 1.5); 
                textParticles[i].size = baseParticleSize * (1 + disintegrationFactor * 1.5);
                textParticles[i].draw();
            }
        } else {
            // Logica normale delle particelle
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            drawText(); 
        }

        requestAnimationFrame(animate);
    }

    // Event listener per la posizione del mouse
    window.addEventListener('mousemove', (event) => {
        if (textParticles.length === 0) {
            mouseX = event.clientX;
            mouseY = event.clientY;
        } else {
            mouseX = null;
            mouseY = null;
        }
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
            textCanvas.width = window.innerWidth;
            textCanvas.height = window.innerHeight;
            initParticles();
        }
    });

    // Logica del click per il testo
    window.addEventListener('click', (event) => {
        // Ignora i click su elementi interattivi
        if (event.target.tagName === 'A' || event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
            return;
        }
        
        const phrase = inklusivaPhrases[Math.floor(Math.random() * inklusivaPhrases.length)];
        activeText = phrase;
        
        clearTimeout(phraseDisplayTimeout);
        phraseDisplayTimeout = setTimeout(() => {
            if(activeText) {
                createTextParticles(activeText, textCanvas.width / 2, textCanvas.height / 2);
            }
        }, textDisplayDuration);
    });

    // Event listener per la tastiera (dimensioni e casualità)
    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            sizeVariation = Math.min(sizeVariation + 1, 10);
        } else if (event.key === 'ArrowDown') {
            sizeVariation = Math.max(sizeVariation - 1, -5);
        } else if (event.key === 'ArrowLeft') {
            variationRandomness = Math.max(variationRandomness - 0.1, 0.1); // Minore di 0.1 per stabilità
        } else if (event.key === 'ArrowRight') {
            variationRandomness = Math.min(variationRandomness + 0.1, 1);
        }
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }
    });

    // =========================================
    // AVVIO
    // =========================================
    
    // 1. Inizializza i canvas (CRUCIALE)
    if (setupCanvas()) {
        // 2. Avvia le particelle solo se i canvas sono stati inizializzati con successo
        initParticles();
        // 3. Avvia l'animazione
        animate();
    }
    
    // 4. Avvia il caricamento dei dati dell'archivio
    caricaDati();

});
