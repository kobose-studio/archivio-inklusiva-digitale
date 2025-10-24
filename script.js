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
                // Non blocca l'esecuzione se fallisce il caricamento
            });
    }

    function visualizzaProgetti(progettiDaMostrare) {
        if (!container) return; // Controllo aggiuntivo
        
        container.innerHTML = ''; 
        
        if (progettiDaMostrare.length === 0) {
            container.innerHTML = '<p>Nessun progetto trovato che corrisponda ai criteri di ricerca/filtro.</p>';
            return;
        }

        progettiDaMostrare.forEach(progetto => {
            const card = document.createElement('div');
            card.className = 'zine-card';
            card.setAttribute('data-id', progetto.id); 
            card.setAttribute('data-tono', progetto.tono_voce);
            
            card.innerHTML = `
                <div class="card-cover">
                    <img src="${progetto.link_copertina}" alt="Copertina di ${progetto.titolo}">
                    <div class="card-details-overlay">
                        <h3>${progetto.titolo}</h3>
                        <p>Autore: ${progetto.autore}</p>
                        <p>Tono: ${progetto.tono_voce}</p>
                        <p>Tema: ${progetto.tema}</p>
                        <a href="${progetto.link_fanzine}" target="_blank" class="download-button">SCARICA FANZINE (${progetto.numero_pagine}p)</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function filtraProgetti() {
        const termineRicerca = barraRicerca.value.toLowerCase();
        const tonoSelezionato = filtroTono.value;
        
        const progettiFiltrati = tuttiIProgetti.filter(progetto => {
            const corrispondeRicerca = 
                progetto.titolo.toLowerCase().includes(termineRicerca) ||
                progetto.autore.toLowerCase().includes(termineRicerca) ||
                progetto.tema.toLowerCase().includes(termineRicerca);
            
            const corrispondeFiltro = tonoSelezionato === '' || progetto.tono_voce === tonoSelezionato;
            
            return corrispondeRicerca && corrispondeFiltro;
        });

        visualizzaProgetti(progettiFiltrati);
    }

    // =========================================
    // AVVIO LOGICA ARCHIVIO (solo per index.html)
    // =========================================

    if (container && barraRicerca && filtroTono) {
        caricaDati();

        // Listener per la ricerca
        barraRicerca.addEventListener('input', filtraProgetti);

        // Listener per il filtro tono
        filtroTono.addEventListener('change', filtraProgetti);
    }

    
    // =========================================
    // PARTE 2: LOGICA PARTICELLE (Universale)
    // =========================================
    
    const canvas = document.getElementById('particleCanvas');
    
    // ✅ MODIFICA CRUCIALE: Eseguiamo tutto il blocco delle particelle SOLO se il canvas esiste
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 200; 
        let mouseX = null;
        let mouseY = null;
        
        let baseSize = 0.5;
        let sizeVariation = 3;
        let variationRandomness = 0.5;

        function setupCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            return true;
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = baseSize;
                this.speedX = (Math.random() * 0.5) - 0.25;
                this.speedY = (Math.random() * 0.5) - 0.25;
                this.color = '#CCFF00';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                if (mouseX !== null && mouseY !== null) {
                    const dx = mouseX - this.x;
                    const dy = mouseY - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        this.size = baseSize + sizeVariation + (Math.random() * variationRandomness);
                        
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = 100;
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = forceDirectionX * force * -0.5;
                        const directionY = forceDirectionY * force * -0.5;

                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
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
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
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

        // AVVIO PARTICELLE
        if (setupCanvas()) {
            initParticles();
            animate();
        }
    }
});
