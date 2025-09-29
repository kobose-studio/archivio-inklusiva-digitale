# Archivio Legacy Digitale 4.0

Questo repository ospita l'Archivio Legacy Digitale 4.0, una collezione scalabile e ricercabile dei progetti di micro-editoria sviluppati durante il corso [Nome del Corso] promosso da [Nome dell'Ente/Organizzazione].

L'archivio è progettato per dimostrare una **P.I. tecnologica** focalizzata su **accessibilità** e **scalabilità**.

---

## 🚀 Progetto Pubblicato

L'archivio è attualmente ospitato e accessibile pubblicamente tramite GitHub Pages.

**Visualizza l'Archivio Online Qui:**
[INSERISCI QUI IL LINK PUBBLICO DI GITHUB PAGES]

---

## 🎯 Obiettivi Tecnologici

Questo progetto è stato sviluppato per dimostrare i seguenti principi di programmazione e architettura dati:

1.  **Scalabilità (JSON Data Source):** L'interfaccia utente (HTML/CSS/JS) è completamente disaccoppiata dai dati. Aggiungere nuovi progetti non richiede la modifica del codice JavaScript, ma solo l'aggiunta di un nuovo blocco di dati nel file `progetti.json`.
2.  **Filtri e Ricerca Dinamica (JavaScript):** Implementazione di funzionalità di ricerca in tempo reale e filtri basati sul "Tono di Voce" per migliorare la fruibilità.
3.  **Architettura Legacy (HTML/CSS/JS/JSON):** Utilizzo di tecnologie front-end semplici e durature per garantire l'accessibilità e la manutenzione a lungo termine del progetto.

---

## 🛠️ Struttura del Repository

L'archivio è composto da una struttura minima essenziale, facile da mantenere:

* **`index.html`**: Il layout e la struttura di base della pagina.
* **`style.css`**: Il design e l'impaginazione dell'archivio.
* **`script.js`**: Il motore logico che carica i dati, genera le schede progetto e gestisce i filtri/la ricerca.
* **`progetti.json`**: Il database di progetto. Contiene tutti i metadati (titolo, autore, tono, link) ed è il file che deve essere aggiornato per espandere l'archivio.
* **`assets/`**: Contiene tutti i file multimediali collegati (copertine JPG e file Fanzine PDF).

---

## 📝 Come Contribuire (Per la Manutenzione)

Per aggiungere o aggiornare un progetto all'archivio, è sufficiente seguire questi passaggi:

1.  Salvare il file della Fanzine (ad esempio, `nuova-fanzine.pdf`) nella cartella **`assets`**.
2.  Aprire e modificare il file **`progetti.json`**.
3.  Aggiungere un nuovo blocco di dati, **ricordandosi di mettere una virgola** dopo l'ultima parentesi graffa `}` del progetto precedente.

**Esempio di Nuovo Blocco in `progetti.json`:**

```json
  // Ultimo progetto esistente
  {
    "id": 3,
    "titolo": "...",
    // ...
  }, // <--- VIRGOLA NECESSARIA
  // Nuovo progetto
  {
    "id": 4, 
    "titolo": "Nuovo Titolo",
    "autore": "Nuovo Autore",
    "modulo_corso": "Modulo X",
    "tono_voce": "Poetico",
    "tema": "Tema Progetto",
    "anno": 2026,
    "link_fanzine": "assets/nuova-fanzine.pdf" 
  }
]
