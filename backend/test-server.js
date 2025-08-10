const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Try importing routes one by one
try {
  const authRoutes = require('./src/routes/auth');
  console.log('✅ Auth routes imported successfully');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.error('❌ Auth routes failed:', error.message);
}

try {
  const userRoutes = require('./src/routes/user');
  console.log('✅ User routes imported successfully');
  app.use('/api/user', userRoutes);
} catch (error) {
  console.error('❌ User routes failed:', error.message);
}

try {
  const dashboardRoutes = require('./src/routes/dashboard');
  console.log('✅ Dashboard routes imported successfully');
  app.use('/api/dashboard', dashboardRoutes);
} catch (error) {
  console.error('❌ Dashboard routes failed:', error.message);
}

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});