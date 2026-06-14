# WIKIBLANK

WIKIBLANK is an interactive web app inspired by the hangman game. The player
must guess the title of a Wikipedia article by revealing hidden words in
the text.

This project was created for the Web Technologies course.

## Main features

- user registration, login, and logout;
- quick games and category-based games;
- guesses for single words and for the article title;
- saved game progress, so games can be continued later;
- lists of active and completed games;
- user leaderboard;
- public access to completed games and leaderboard.

## Running the application

### Requirements

- Node.js;
- npm.

### Installation

From the project root, install the dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Create `backend/.env` from `backend/.env.example` and set at least a JWT
secret:

```env
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
DATABASE_PATH=./data/wikblank.sqlite
```
You can generate a random secret by running this command in a terminal: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

### Development mode

Start the backend and frontend together:

```bash
npm run dev
```

The application will be available at:

- frontend: `http://localhost:5173`;
- backend API: `http://localhost:3001/api`.

You can also start the two processes separately with `npm run dev:backend`
and `npm run dev:frontend`.

### Build and start

Build and start the backend:

```bash
npm --prefix backend run build
npm --prefix backend run start
```

In another terminal, build and serve the frontend:

```bash
npm --prefix frontend run build
npm --prefix frontend run preview
```

When `NODE_ENV=production`, the backend requires `JWT_SECRET` and marks the
authentication cookie as secure. In a real production environment, the
application must therefore be served through HTTPS. When testing locally,
browsers may still accept secure cookies over HTTP on `localhost`, because
they treat it as a trusted local address. This behavior should not be expected
for other HTTP domains or network addresses.

## Technologies

### Frontend

- React 19;
- TypeScript;
- Vite 8;
- React Router;
- Axios;
- CSS Modules.

### Backend

- Node.js;
- Express 5;
- TypeScript;
- SQLite with `better-sqlite3`;
- `tsx` for development.

### Authentication and security

- JSON Web Tokens with `jsonwebtoken`;
- HTTP-only cookies for storing the token;
- bcrypt for password hashing;
- CORS and `cookie-parser`;
- dotenv for environment variables.

### Testing and code quality

- Playwright for end-to-end tests;
- ESLint;
- a separate SQLite database and fixed data for E2E tests;
- `concurrently` to start the frontend and backend together.

## End-to-end tests

Playwright automatically starts the frontend and backend with a separate E2E
database. Run the tests from the project root:

```bash
npx playwright test
```

Open the generated HTML report with:

```bash
npx playwright show-report
```

## Project description

For each game, the system selects an encyclopedia article and shows its text
with hidden words. When the player guesses a word, all matches of that word
are revealed.

The player can try to guess the article title at any time. The game ends when
the correct title is found or when the player chooses to leave the game.

Game progress is saved on the server. This allows signed-in users to stop a
game and continue it later. Guests can browse leaderboard and view completed
games.
