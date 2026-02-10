const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { ContactForm } = require('../models/forms');
const telegramService = require('../services/telegram');

// Валидация для контактной формы
const contactFormValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('position').isIn([
    'Clinic Owner',
    'Laboratory Owner / Dental Technician',
    'Self-employed dentist',
    'Buyer',
    'Dealer',
    'Agent',
    'Other'
  ]).withMessage('Invalid position'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('privacyAccepted').isBoolean().equals('true').withMessage('Privacy policy must be accepted')
];

// POST - Создать новую заявку
router.post('/', contactFormValidation, async (req, res) => {
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
    const contactForm = new ContactForm({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      city: req.body.city,
      province: req.body.province,
      country: req.body.country,
      message: req.body.message,
      contactDays: req.body.contactDays,
      privacyAccepted: req.body.privacyAccepted,
      newsletterConsent: req.body.newsletterConsent || false
    });

    await contactForm.save();

    // Отправка уведомления в Telegram
    await telegramService.sendContactFormNotification(contactForm);

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contactForm._id,
        createdAt: contactForm.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
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
      position,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Фильтры
    const filter = {};
    if (status) filter.status = status;
    if (position) filter.position = position;

    // Пагинация
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const forms = await ContactForm.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ContactForm.countDocuments(filter);

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
    console.error('Error fetching contact forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact forms',
      error: error.message
    });
  }
});

// GET - Получить заявку по ID
router.get('/:id', async (req, res) => {
  try {
    const form = await ContactForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact form',
      error: error.message
    });
  }
});

// PUT - Обновить заявку (для админа)
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const form = await ContactForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    const oldStatus = form.status;

    if (status) form.status = status;
    if (notes !== undefined) form.notes = notes;

    await form.save();

    // Отправка уведомления об изменении статуса
    if (status && status !== oldStatus) {
      await telegramService.sendStatusUpdate('contact', form._id, oldStatus, status, form);
    }

    res.json({
      success: true,
      message: 'Contact form updated successfully',
      data: form
    });
  } catch (error) {
    console.error('Error updating contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact form',
      error: error.message
    });
  }
});

// DELETE - Удалить заявку
router.delete('/:id', async (req, res) => {
  try {
    const form = await ContactForm.findByIdAndDelete(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact form',
      error: error.message
    });
  }
});

// GET - Статистика
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await ContactForm.countDocuments();
    const newForms = await ContactForm.countDocuments({ status: 'new' });
    const inProgress = await ContactForm.countDocuments({ status: 'in_progress' });
    const completed = await ContactForm.countDocuments({ status: 'completed' });

    // Статистика по позициям
    const byPosition = await ContactForm.aggregate([
      { $group: { _id: '$position', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          new: newForms,
          in_progress: inProgress,
          completed
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

module.exports = router;
