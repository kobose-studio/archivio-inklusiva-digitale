document.addEventListener('DOMContentLoaded', () => {
    // 1. Definisci le costanti e le variabili
    const container = document.getElementById('archivio-container');
    const barraRicerca = document.getElementById('barra-ricerca');
    const filtroTono = document.getElementById('filtro-tono');
    let tuttiIProgetti = []; // Array per conservare tutti i progetti caricati

    // 2. Funzione per caricare i dati dal JSON (il motore della scalabilità)
    function caricaDati() {
        // Usa la funzione fetch per ottenere i dati dal file JSON
        fetch('progetti.json')
            .then(response => {
                // Se la risposta è positiva, converti in oggetto JavaScript
                if (!response.ok) {
                    throw new Error('Errore nel caricamento del file progetti.json');
                }
                return response.json();
            })
            .then(data => {
                tuttiIProgetti = data; // Salva i dati
                visualizzaProgetti(tuttiIProgetti); // Visualizza tutti i progetti all'avvio
            })
            .catch(error => {
                console.error("Errore nel caricamento dell'archivio:", error);
                container.innerHTML = '<p class="errore">Impossibile caricare l\'archivio in questo momento. Controlla il file progetti.json.</p>';
            });
    }

    // 3. Funzione per creare e visualizzare le schede dei progetti
    function visualizzaProgetti(progettiDaMostrare) {
        container.innerHTML = ''; // Svuota il contenitore prima di inserire i nuovi risultati

        if (progettiDaMostrare.length === 0) {
            container.innerHTML = '<p class="risultato-nullo">Nessun progetto trovato che corrisponda ai criteri di ricerca/filtro.</p>';
            return;
        }

        progettiDaMostrare.forEach(progetto => {
            // Crea l'elemento HTML (la "card")
            const card = document.createElement('div');
            card.className = 'progetto-card';

            // Costruisci il contenuto della card
            card.innerHTML = `
                <h2>${progetto.titolo}</h2>
                <p><strong>Autore:</strong> ${progetto.autore}</p>
                <p><strong>Tema:</strong> ${progetto.tema}</p>
                <p><strong>Tono di Voce:</strong> ${progetto.tono_voce}</p>
                <p><strong>Modulo:</strong> ${progetto.modulo_corso}</p>
                <a href="${progetto.link_fanzine}" target="_blank">VEDI FANZINE</a>
            `;
            // Aggiungi la card al contenitore principale
            container.appendChild(card);
        });
    }

    // 4. Funzione principale per filtrare e cercare i progetti (il cuore della fruibilità)
    function filtraEOrdinaProgetti() {
        // Valori di ricerca e filtro (convertiti in minuscolo per una ricerca non case-sensitive)
        const testoRicerca = barraRicerca.value.toLowerCase();
        const tonoSelezionato = filtroTono.value;

        // Filtra i progetti in base alla ricerca testuale E al filtro del tono
        const progettiFiltrati = tuttiIProgetti.filter(progetto => {
            // Criterio di ricerca: titolo, autore, o tema contiene il testo Ricerca
            const corrispondeRicerca = progetto.titolo.toLowerCase().includes(testoRicerca) ||
                                       progetto.autore.toLowerCase().includes(testoRicerca) ||
                                       progetto.tema.toLowerCase().includes(testoRicerca);
            
            // Criterio di filtro: il tono corrisponde O il filtro è "Tutti"
            const corrispondeTono = !tonoSelezionato || progetto.tono_voce === tonoSelezionato;

            // Restituisce TRUE solo se entrambi i criteri sono soddisfatti
            return corrispondeRicerca && corrispondeTono;
        });

        // Dopo il filtro, visualizza i risultati
        visualizzaProgetti(progettiFiltrati);
    }

    // 5. Aggiungi i listener degli eventi per attivare il filtro
    barraRicerca.addEventListener('input', filtraEOrdinaProgetti);
    filtroTono.addEventListener('change', filtraEOrdinaProgetti);

    // 6. Inizia caricando i dati all'avvio della pagina
    caricaDati();
});