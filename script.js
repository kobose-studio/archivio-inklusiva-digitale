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

    if (container) {
        caricaDati();

        // Listener per la ricerca
        barraRicerca.addEventListener('input', filtraProgetti);

        // Listener per il filtro tono
        filtroTono.addEventListener('change', filtraProgetti);
    }
});
