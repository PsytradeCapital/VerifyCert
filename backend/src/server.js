// Placeholder server file - will be implemented in later tasks
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VerifyCert Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});