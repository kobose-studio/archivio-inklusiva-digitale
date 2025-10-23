document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // PARTE 1: LOGICA ARCHIVIO (Caricamento, Filtro, Visualizzazione)
    // =========================================

    const container = document.getElementById('archivio-container');
    const barraRicerca = document.getElementById('barra-ricerca');
    const filtroTono = document.getElementById('filtro-tono');
    let tuttiIProgetti = []; // Array per conservare tutti i progetti caricati

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
                container.innerHTML = '<p class="errore">Impossibile caricare l\'archivio. Controlla il file progetti.json.</p>';
            });
    }

    // Funzione 2: Crea e visualizza le schede dei progetti
    function visualizzaProgetti(progettiDaMostrare) {
        container.innerHTML = ''; // Pulisci il contenitore
        
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

    // Avvia il caricamento dei dati
    caricaDati();

    // =========================================
    // PARTE 2: PARTICLE SYSTEM (Adattato al tema INKLUSIVA)
    // =========================================

    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const textCanvas = document.getElementById('textCanvas');
    const textCtx = textCanvas.getContext('2d');
    textCanvas.width = window.innerWidth;
    textCanvas.height = window.innerHeight;

    // Colore Lime Brutalista (dalla variabile CSS)
    const limeColor = getComputedStyle(document.documentElement).getPropertyValue('--colore-accento').trim(); 
    
    let particles = [];
    const numParticles = 200;
    const repulsionDistance = 150;
    const repulsionStrength = 0.6;
    const particleSize = 8;
    const particleColor = limeColor; // Usa il colore lime
    let sizeVariation = 0;
    let variationRandomness = 0.5;

    let mouseX = null;
    let mouseY = null;
    let activeText = '';
    let textParticles = [];
    let disintegrationFactor = 0;
    let phraseDisplayTimeout;
    let textDisplayDuration = 4000; // Tempo di visualizzazione aumentato

    const platonicSolids = [
        { name: 'tetrahedron', sides: 4 },
        { name: 'cube', sides: 6 },
        { name: 'octahedron', sides: 8 },
        { name: 'dodecahedron', sides: 12 },
        { name: 'icosahedron', sides: 20 },
    ];

    // Frasi sostituite con concetti chiave di INKLUSIVA
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
        constructor(x, y, color = particleColor, size = particleSize) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.velocityX = Math.random() * 2 - 1;
            this.velocityY = Math.random() * 2 - 1;
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
            // Fade-in effect
            if (this.alpha < 1) {
                this.alpha += this.fadeSpeed;
            }

            // Apply repulsion from mouse
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

            // Add wandering force
            this.velocityX += (Math.random() - 0.5) * this.wanderStrength;
            this.velocityY += (Math.random() - 0.5) * this.wanderStrength;
            this.velocityX += (this.baseVelocity.x - this.velocityX) * 0.005;
            this.velocityY += (this.baseVelocity.y - this.velocityY) * 0.005;

            // Apply velocity and friction
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;

            // Bounce off edges 
            const damping = 0.7;
            if (this.x + this.size > canvas.width) {
                this.x = canvas.width - this.size;
                this.velocityX = -this.velocityX * damping;
            }
            if (this.x - this.size < 0) {
                this.x = this.size;
                this.velocityX = -this.velocityX * damping;
            }
            if (this.y + this.size > canvas.height) {
                this.y = canvas.height - this.size;
                this.velocityY = -this.velocityY * damping;
            }
            if (this.y - this.size < 0) {
                this.y = this.size;
                this.velocityY = -this.velocityY * damping;
            }

            // Dimensione dinamica
            const randomFactor = (Math.random() - 0.5) * variationRandomness * 2;
            this.targetSize = particleSize + sizeVariation + randomFactor * 10;
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
            particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
    }

    // Crea le particelle del testo per l'effetto di disintegrazione
    function createTextParticles(text, x, y) {
        textParticles = [];
        const fontSize = 38; 
        textCtx.font = `700 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`; // Usa il font del body (Space Mono)
        textCtx.fillStyle = limeColor;
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        textCtx.fillText(text, x, y);

        const textData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;

        for (let i = 0; i < textCanvas.width; i += 4) {
            for (let j = 0; j < textCanvas.height; j += 4) {
                const pixelAlpha = textData[(j * textCanvas.width + i) * 4 + 3];
                if (pixelAlpha > 128) {
                    const xPos = i;
                    const yPos = j;
                    textParticles.push(new Particle(xPos, yPos, limeColor, 2));
                }
            }
        }
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    }
    
    // Mostra il testo statico quando non c'è interazione
    function drawText() {
        if (activeText) {
            const fontSize = 38;
            textCtx.globalAlpha = 1;
            textCtx.font = `700 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
            textCtx.fillStyle = limeColor; // Testo statico in Lime
            textCtx.textAlign = 'center';
            textCtx.textBaseline = 'middle';
            textCtx.fillText(activeText, textCanvas.width / 2, textCanvas.height / 2);
            textCtx.globalAlpha = 1;
        }
    }

    // Ciclo di animazione
    function animate() {
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
                textParticles[i].size = particleSize * (1 + disintegrationFactor * 1.5);
                textParticles[i].draw();
            }
        } else {
            // Logica normale delle particelle
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
        }

        requestAnimationFrame(animate);
    }

    // Event listener per la posizione del mouse
    window.addEventListener('mousemove', (event) => {
        // Aggiorna la posizione del mouse solo se non stiamo disintegrando il testo
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
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        textCanvas.width = window.innerWidth;
        textCanvas.height = window.innerHeight;
        initParticles();
    });

    // Logica del click per il testo
    window.addEventListener('click', (event) => {
        // Evita che il click interferisca con gli elementi dell'archivio (se non è il canvas stesso)
        if (event.target.tagName !== 'CANVAS' && event.target.tagName !== 'BODY') {
            return;
        }
        
        // Scegli una frase casuale da INKLUSIVA
        const phrase = inklusivaPhrases[Math.floor(Math.random() * inklusivaPhrases.length)];
        active
