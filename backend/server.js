const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');



dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));



const authMiddleware = require('./middleware/authMiddleware');

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

const documentRoutes = require('./routes/documentRoutes');

app.use('/api/documents', documentRoutes);



// Routes   
app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('DMS Backend Running...');
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



