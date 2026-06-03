import { initializeDatabase } from './db/initializeDatabase.js';

const PORT = 3001;

initializeDatabase();

const { app } = await import('./app.js');

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
