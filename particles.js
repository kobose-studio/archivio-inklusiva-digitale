document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('particleCanvas');
    if (!canvas) {
        // Se il canvas non esiste (es. nella pagina che non lo ha, anche se in teoria ora lo hanno tutte)
        return; 
    }
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 200; 
    let mouseX = null;
    let mouseY = null;
    
    // Variabili per la manipolazione tramite tastiera
    let baseSize = 0.5; // Dimensione base
    let sizeVariation = 3; // Quanto la dimensione varia con il movimento/casualità
    let variationRandomness = 0.5; // Fattore di casualità (0.1 = minima, 1.0 = massima)

    function setupCanvas() {
        if (!canvas) return false;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return true;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = baseSize;
            this.speedX = (Math.random() * 0.5) - 0.25; // Movimento orizzontale lento
            this.speedY = (Math.random() * 0.5) - 0.25; // Movimento verticale lento
            this.color = '#CCFF00'; // Lime Elettrico
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Ritorna le particelle ai bordi opposti se escono
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;

            // Logica di interazione con il mouse
            if (mouseX !== null && mouseY !== null) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    // Aumenta la dimensione vicino al mouse
                    this.size = baseSize + sizeVariation + (Math.random() * variationRandomness);
                    
                    // Respinta (spinge via le particelle)
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = 100;
                    const force = (maxDistance - distance) / maxDistance; // Forza inversamente proporzionale alla distanza
                    const directionX = forceDirectionX * force * -0.5;
                    const directionY = forceDirectionY * force * -0.5;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Torna alla dimensione base
                    this.size = baseSize + (Math.random() * variationRandomness);
                }
            } else {
                this.size = baseSize + (Math.random() * variationRandomness);
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Scia leggera
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('mousemove', (event) => {
        mouseX = event.x;
        mouseY = event.y;
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
    // AVVIO PARTICELLE
    // =========================================
    
    if (setupCanvas()) {
        initParticles();
        animate();
    }
});
