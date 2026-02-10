const mongoose = require('mongoose');

// Схема для первой формы (информационный запрос)
const contactFormSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    enum: [
      'Clinic Owner',
      'Laboratory Owner / Dental Technician',
      'Self-employed dentist',
      'Buyer',
      'Dealer',
      'Agent',
      'Other'
    ]
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  contactDays: {
    type: String,
    trim: true
  },
  privacyAccepted: {
    type: Boolean,
    required: true,
    default: false
  },
  newsletterConsent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'completed', 'archived'],
    default: 'new'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Схема для второй формы (заявка на работу)
const applicationFormSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  applicationPosition: {
    type: String,
    required: true,
    enum: [
      'Implantologists Speakers',
      'Italy/Abroad Agents',
      'Dealer-Distributors Italy/Abroad',
      'Other'
    ]
  },
  contactHours: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  cvFile: {
    filename: String,
    path: String,
    originalName: String,
    mimetype: String,
    size: Number
  },
  privacyAccepted: {
    type: Boolean,
    required: true,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'new'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware для обновления updatedAt
contactFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

applicationFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ContactForm = mongoose.model('ContactForm', contactFormSchema);
const ApplicationForm = mongoose.model('ApplicationForm', applicationFormSchema);

module.exports = {
  ContactForm,
  ApplicationForm
};
