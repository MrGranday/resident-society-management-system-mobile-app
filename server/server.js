
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const societyRoutes = require('./routes/societies');
const issueRoutes = require('./routes/issueRoutes');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');

const app = express();

// Ensure Uploads directory exists
const uploadDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created Uploads directory');
}

// Increase payload limit to 10MB
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Serve static files for uploaded images
app.use('/Uploads', express.static(uploadDir));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 2000 requests per windowMs
});
app.use(limiter);

// Log MongoDB URI for debugging
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Validate environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/staff', staffRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/issues', issueRoutes); // Fixed mount point
app.use('/api/events', eventRoutes);
app.use('/api', announcementRoutes); // Fixed mount point

// Default route for testing
app.get('/test', (req, res) => res.send('Server is running'));

// Catch-all for unmatched routes
app.use((req, res) => {
  console.log(`No route found for: ${req.method} ${req.url}`);
  res.status(404).send('Route not found');
});

// Graceful shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});