const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { ApplicationForm } = require('../models/forms');
const telegramService = require('../services/telegram');

// Настройка хранилища для файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cv/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов (только PDF и DOC)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and DOC files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Валидация для формы заявки
const applicationFormValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('applicationPosition').isIn([
    'Implantologists Speakers',
    'Italy/Abroad Agents',
    'Dealer-Distributors Italy/Abroad',
    'Other'
  ]).withMessage('Invalid position'),
  body('privacyAccepted').equals('true').withMessage('Privacy policy must be accepted')
];

// POST - Создать новую заявку на работу
router.post('/', upload.single('cv'), applicationFormValidation, async (req, res) => {
  try {
    // Проверка валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Создание новой заявки
    const applicationData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      applicationPosition: req.body.applicationPosition,
      contactHours: req.body.contactHours,
      message: req.body.message,
      privacyAccepted: req.body.privacyAccepted
    };

    // Добавление информации о файле, если загружен
    if (req.file) {
      applicationData.cvFile = {
        filename: req.file.filename,
        path: req.file.path,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    const applicationForm = new ApplicationForm(applicationData);
    await applicationForm.save();

    // Отправка уведомления в Telegram
    await telegramService.sendApplicationFormNotification(applicationForm);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: applicationForm._id,
        createdAt: applicationForm.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
});

// GET - Получить все заявки (с фильтрацией и пагинацией)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      applicationPosition,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Фильтры
    const filter = {};
    if (status) filter.status = status;
    if (applicationPosition) filter.applicationPosition = applicationPosition;

    // Пагинация
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const forms = await ApplicationForm.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ApplicationForm.countDocuments(filter);

    res.json({
      success: true,
      data: forms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// GET - Получить заявку по ID
router.get('/:id', async (req, res) => {
  try {
    const form = await ApplicationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// PUT - Обновить заявку (для админа)
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const form = await ApplicationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const oldStatus = form.status;

    if (status) form.status = status;
    if (notes !== undefined) form.notes = notes;

    await form.save();

    // Отправка уведомления об изменении статуса
    if (status && status !== oldStatus) {
      await telegramService.sendStatusUpdate('application', form._id, oldStatus, status, form);
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: form
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
});

// DELETE - Удалить заявку
router.delete('/:id', async (req, res) => {
  try {
    const form = await ApplicationForm.findByIdAndDelete(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
});

// GET - Статистика
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await ApplicationForm.countDocuments();
    const newApplications = await ApplicationForm.countDocuments({ status: 'new' });
    const reviewed = await ApplicationForm.countDocuments({ status: 'reviewed' });
    const shortlisted = await ApplicationForm.countDocuments({ status: 'shortlisted' });
    const hired = await ApplicationForm.countDocuments({ status: 'hired' });

    // Статистика по позициям
    const byPosition = await ApplicationForm.aggregate([
      { $group: { _id: '$applicationPosition', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          new: newApplications,
          reviewed,
          shortlisted,
          hired
        },
        byPosition
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// GET - Скачать CV
router.get('/:id/download-cv', async (req, res) => {
  try {
    const form = await ApplicationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!form.cvFile || !form.cvFile.path) {
      return res.status(404).json({
        success: false,
        message: 'CV file not found'
      });
    }

    res.download(form.cvFile.path, form.cvFile.originalName);
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading CV',
      error: error.message
    });
  }
});

module.exports = router;
