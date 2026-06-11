import 'dotenv/config';

const PORT = 3001;

const { initializeDatabase } = await import('./db/initializeDatabase.js');
initializeDatabase();

const { app } = await import('./app.js');

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
