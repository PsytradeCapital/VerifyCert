// Quick test to see if server starts
const express = require('express');
const app = express();

app.use(express.json());

// Import the simple user routes
const userRoutes = require('./src/routes/user-simple');
app.use('/api/user', userRoutes);

app.get('/test', (req, res) => {
  res.json({ message: 'Server working' });
});

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`Quick test server running on port ${PORT}`);
  console.log('✅ Server started successfully with simple user routes');
});