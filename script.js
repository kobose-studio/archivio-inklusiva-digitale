document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // PARTE 1: GESTIONE ARCHIVIO (RIPRISTINATA LA VERSIONE FUNZIONANTE)
    // =========================================

    // Dati fittizi per l'archivio (VERIFICATI)
    const datiZine = [
        { titolo: "Bio-Punk", tono: "Distopico", anno: 2024, copertina: "Bull_cover.jpg-d18247fc-00cd-496d-a5ce-95634aa2efd9", file: "01_Bio-Punk_135x192_16p.pdf" },
        { titolo: "Bull", tono: "Noir", anno: 2024, copertina: "Bull_cover.jpg-d18247fc-00cd-496d-a5ce-95634aa2efd9", file: "Bull_24p_web.pdf" },
        { titolo: "Far-Fest", tono: "Preistorico", anno: 2024, copertina: "Far-Fest_kobose_cover.jpg-8bdac405-0fd5-4883-9b64-5e1350f54d16", file: "Far-Fest_kobose_zine-web.pdf" },
        { titolo: "(F)Act", tono: "Vibrante", anno: 2024, copertina: "(F)Act_kobose_cover.jpg-847756a2-80c3-4c75-bacc-3bee88363b08", file: "(F)Act_kobose_16p_spread.pdf" }
    ];

    function caricaDati() {
        const container = document.getElementById('archivio-container');
        if (!container) return; // Non fa nulla se non è nella pagina Archivio

        datiZine.forEach(zine => {
            const card = document.createElement('div');
            card.className = 'progetto-card';

            // Questa parte è stata RIPRISTINATA alla versione ORIGINALE
            card.innerHTML = `
                <a href="${zine.file}" target="_blank">
                    <img src="${zine.copertina}" alt="Copertina di ${zine.titolo}" class="copertina-fanzine">
                    <h2>${zine.titolo}</h2>
                </a>
                <p><strong>Tono:</strong> ${zine.tono}</p>
                <p><strong>Anno:</strong> ${zine.anno}</p>
            `;
            container.appendChild(card);
        });
    }

    // =========================================
    // PARTE 2: PARTICLE SYSTEM
    // =========================================

    let canvas, ctx;
    let particleColor;
    
    let particles = [];
    const numParticles = 200;
    const repulsionDistance = 150;
    const repulsionStrength = 0.6;
    const baseParticleSize = 8; 
    let sizeVariation = 0; 
    let variationRandomness = 0.5; 

    let mouseX = null;
    let mouseY = null;

    const platonicSolids = [
        { name: 'tetrahedron', sides: 4 },
        { name: 'cube', sides: 6 },
        { name: 'octahedron', sides: 8 },
        { name: 'dodecahedron', sides: 12 },
        { name: 'icosahedron', sides: 20 },
    ];

    function setupCanvas() {
        canvas = document.getElementById('particleCanvas');
        if (!canvas) {
            return false;
        }

        ctx = canvas.getContext('2d');
        if (!ctx) {
             console.error("Errore: Impossibile ottenere il contesto 2D del canvas.");
             return false;
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const computedStyle = getComputedStyle(document.documentElement);
        particleColor = computedStyle.getPropertyValue('--colore-accento').trim(); 
        
        if (!particleColor || particleColor.length < 4) {
             console.warn("Avviso: Colore CSS non letto correttamente. Uso fallback: #CCFF00.");
             particleColor = "#CCFF00"; 
        }
        
        return true;
    }

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

    class Particle {
        constructor(x, y, color = particleColor, size = baseParticleSize) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
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

            this.velocityX += (Math.random() - 0.5) * this.wanderStrength;
            this.velocityY += (Math.random() - 0.5) * this.wanderStrength;
            
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.velocityX *= this.friction;
            this.velocityY *= this.friction;

            const damping = 0.7;
            if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                this.velocityX *= -damping;
            }
            if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                this.velocityY *= -damping;
            }
            this.x = Math.max(this.size, Math.min(this.x, canvas.width - this.size));
            this.y = Math.max(this.size, Math.min(this.y, canvas.height - this.size));

            const randomFactor = (Math.random() - 0.5) * variationRandomness * 2;
            this.targetSize = baseParticleSize + sizeVariation + randomFactor * 5;
            this.size += (this.targetSize - this.size) * 0.1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 1; 
            drawPolygon(ctx, this.x, this.y, this.size, this.shape.sides);
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
    }

    function animate() {
        if (!ctx) return; 

        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        requestAnimationFrame(animate);
    }

    // =========================================
    // GESTIONE EVENTI
    // =========================================

    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouseX = null;
        mouseY = null;
    });

    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }
    });

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
            event.preventDefault(); 
        }
    });

    // =========================================
    // AVVIO
    // =========================================
    
    // 1. Avvia l'archivio (solo su index.html, non rompe le sottopagine)
    caricaDati(); 

    // 2. Avvia il sistema di particelle (su tutte le pagine che hanno il canvas)
    if (setupCanvas()) {
        initParticles();
        animate();
    }
});
