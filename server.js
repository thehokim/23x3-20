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

// --- 1. GLOBAL MIDDLEWARE (CORS, COOKIES, SESSION) ---
// Note: Removed express.json() and urlencoded() from here!

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

app.use(cookieParser()); // Must be before session

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-very-long-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Статические файлы
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental_forms')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Импорты роутов (но подключать будем позже)
const createAdminRouter = require('./components/admin.config');
const contactFormsRouter = require('./routes/contactForms');
const applicationFormsRouter = require('./routes/applicationForms');

// Start server function
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // --- 2. ADMIN JS (MUST BE BEFORE BODY PARSERS) ---
    const admin = await createAdminRouter(app);
    console.log('✅ AdminJS Router attached');

    // --- 3. BODY PARSERS (NOW WE ATTACH THEM) ---
    // Moved here so they don't conflict with AdminJS
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // --- 4. API ROUTES ---
    // Attached after body parsers so they can read JSON data
    app.use('/api/contact-forms', contactFormsRouter);
    app.use('/api/application-forms', applicationFormsRouter);

    // Базовый роут
    app.get('/', (req, res) => {
      res.json({
        message: 'Dental Forms API',
        version: '1.0.0',
        endpoints: {
          contactForms: '/api/contact-forms',
          applicationForms: '/api/application-forms'
        }
      });
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      });
    });

    // --- 5. ERROR HANDLERS ---
    
    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      // Если заголовки уже отправлены (например, стриминг), передаем дальше
      if (res.headersSent) {
        return next(err);
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Start Listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🔐 Admin Panel: http://localhost:${PORT}${admin.options.rootPath}`);
      console.log(`   Login: ${process.env.ADMIN_EMAIL || 'admin@example.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    });

  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;