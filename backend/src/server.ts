import app from './app';

const port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
  console.log(`Cryus AI-Driven Token Generation Platform API running at: http://localhost:${port}`);
}); 