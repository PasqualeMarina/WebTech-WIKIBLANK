# WebTech-WIKIBLANK

WIKIBLANK: An interactive web platform where users guess the title of encyclopedic articles by uncovering hidden words. Web Technologies course project.

## Project Assignment

Si vuole realizzare WIKIBLANK, una piattaforma web ispirata al gioco dell'impiccato e basata su articoli enciclopedici. Per ogni partita, il sistema seleziona casualmente un articolo da un insieme di pagine ottenute tramite API esterne e ne mostra il contenuto testuale con le parole oscurate.

Gli utenti registrati potranno avviare una nuova partita e provare a scoprire l'articolo inserendo parole come tentativi: ogni parola indovinata correttamente verra rivelata in tutte le sue occorrenze nel testo. In qualsiasi momento, il giocatore potra provare a indovinare il titolo dell'articolo; la partita termina quando il titolo viene individuato correttamente oppure quando il giocatore decide di abbandonare.

Lo stato di ogni partita deve essere salvato in maniera persistente lato server, cosi da consentire a un giocatore di riprendere la partita su un dispositivo diverso da quello su cui la partita e' iniziata.

Tutti gli utenti, anche quelli non registrati, potranno consultare una raccolta delle partite concluse e visualizzarne i dettagli, come il testo parzialmente scoperto, il titolo corretto, il numero di tentativi effettuati e il tempo impiegato. Gli utenti autenticati, invece, potranno giocare nuove partite e comparire in una classifica basata sul tempo medio necessario a indovinare il titolo e sul numero di partite completate con successo.

Per rendere le partite piu interessanti, si suggerisce di scegliere pagine non troppo brevi ne troppo lunghe, e che abbiano titoli non troppo lunghi. Inoltre, e' possibile anche scegliere la pagina iniziale casualmente da un pool piu ristretto di pagine, ad esempio pagine di calciatori famosi, squadre di calcio, animali o personaggi storici.

## Chosen Technology Stack

Frontend:

- React
- Vite
- TypeScript
- CSS Modules or component-based CSS

Backend:

- Node.js
- Express
- TypeScript

Database:

- SQLite

Authentication:

- cookie-based sessions
- passwords hashed with bcrypt

Supporting libraries:

- better-sqlite3 or sqlite for database access
- express-session for session management
- bcrypt for password hashing
- zod for API input validation
- Vitest for optional automated tests

## Why This Stack

The combination of React, Vite and TypeScript makes it possible to build an interactive and maintainable interface for managing games, hidden words, guesses and scores.

Node.js with Express provides a backend that is simple to understand and extend, suitable for creating the APIs required for users, articles, games and match history.

SQLite is a lightweight choice that fits a university project well, because it stores data in a single file and does not require a separate database server.

Cookie-based sessions are a clear solution for a traditional web application with login, while bcrypt allows passwords to be stored securely.
