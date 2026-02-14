require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

// Создание папок для загрузки файлов
const uploadsDir = path.join(__dirname, 'uploads');
const cvDir = path.join(uploadsDir, 'cv');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(cvDir)) fs.mkdirSync(cvDir, { recursive: true });

// --- 1. BODY PARSERS FIRST (before any routes) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. CORS - Allow all origins for testing ---
app.use(cors({
  origin: true, // Allow all origins during development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// --- 3. COOKIES & SESSION ---
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-very-long-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// --- 4. STATIC FILES ---
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// --- 5. MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental_forms')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- 6. ROUTES ---
const createAdminRouter = require('./components/admin.config');
const contactFormsRouter = require('./routes/contactForms');
const applicationFormsRouter = require('./routes/applicationForms');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // API Routes (before AdminJS to ensure they get priority)
    app.use('/api/contact-forms', contactFormsRouter);
    app.use('/api/application-forms', applicationFormsRouter);

    // AdminJS (will handle its own body parsing internally)
    const admin = await createAdminRouter(app);
    console.log('✅ AdminJS Router attached');

    // --- 7. BASE ROUTES ---
    app.get('/', (req, res) => {
      res.json({
        message: 'Dental Forms API',
        version: '1.0.0',
        endpoints: {
          contactForms: '/api/contact-forms',
          applicationForms: '/api/application-forms',
          admin: admin.options.rootPath
        }
      });
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      });
    });

    // --- 8. ERROR HANDLERS ---
    
    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.path}`
      });
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error('❌ Error:', err.stack);
      
      if (res.headersSent) {
        return next(err);
      }
      
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    // --- 9. START SERVER ---
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════════════╗
║  🚀 Server Started Successfully                ║
╠════════════════════════════════════════════════╣
║  Port: ${PORT}                                  
║  Environment: ${process.env.NODE_ENV || 'development'}
║  
║  🌐 URLs:
║    API:    http://localhost:${PORT}
║    Admin:  http://localhost:${PORT}${admin.options.rootPath}
║  
║  🔐 Admin Login:
║    Email:    ${process.env.ADMIN_EMAIL || 'admin@example.com'}
║    Password: ${process.env.ADMIN_PASSWORD || 'admin123'}
║  
║  📡 CORS: Enabled for all origins
╚════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Fatal error starting server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

module.exports = app;