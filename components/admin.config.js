const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const { ContactForm, ApplicationForm } = require('../models/forms');  // ← не забудь ../

// Регистрация адаптера — ОДНОЙ строкой!
AdminJS.registerAdapter(AdminJSMongoose);

// Конфигурация для контактных форм
const contactFormResource = {
  resource: ContactForm,
  options: {
    navigation: {
      name: 'Формы',
      icon: 'DocumentText',
    },
    properties: {
      _id: {
        isVisible: { list: true, filter: true, show: true, edit: false },
      },
      firstName: {
        isTitle: true,
        position: 1,
      },
      lastName: {
        position: 2,
      },
      email: {
        position: 3,
      },
      phone: {
        position: 4,
      },
      position: {
        position: 5,
        availableValues: [
          { value: 'Clinic Owner', label: 'Clinic Owner' },
          { value: 'Laboratory Owner / Dental Technician', label: 'Laboratory Owner / Dental Technician' },
          { value: 'Self-employed dentist', label: 'Self-employed dentist' },
          { value: 'Buyer', label: 'Buyer' },
          { value: 'Dealer', label: 'Dealer' },
          { value: 'Agent', label: 'Agent' },
          { value: 'Other', label: 'Other' },
        ],
      },
      status: {
        position: 6,
        availableValues: [
          { value: 'new', label: '🆕 Новая' },
          { value: 'in_progress', label: '⏳ В работе' },
          { value: 'completed', label: '✅ Завершена' },
          { value: 'archived', label: '📦 Архив' },
        ],
      },
      city: {
        position: 7,
      },
      province: {
        position: 8,
      },
      country: {
        position: 9,
      },
      message: {
        type: 'textarea',
        position: 10,
      },
      contactDays: {
        position: 11,
      },
      privacyAccepted: {
        position: 12,
        isVisible: { list: false, filter: true, show: true, edit: false },
      },
      newsletterConsent: {
        position: 13,
        isVisible: { list: false, filter: true, show: true, edit: false },
      },
      notes: {
        type: 'textarea',
        position: 14,
      },
      createdAt: {
        isVisible: { list: true, filter: true, show: true, edit: false },
        position: 15,
      },
      updatedAt: {
        isVisible: { list: true, filter: true, show: true, edit: false },
        position: 16,
      },
    },
    listProperties: ['firstName', 'lastName', 'email', 'phone', 'position', 'city', 'status', 'createdAt'],
    filterProperties: ['firstName', 'lastName', 'email', 'status', 'position', 'city', 'country', 'createdAt'],
    showProperties: [
      'firstName', 'lastName', 'email', 'phone', 'position', 
      'city', 'province', 'country', 'message', 'contactDays',
      'status', 'notes', 'privacyAccepted', 'newsletterConsent',
      'createdAt', 'updatedAt'
    ],
    editProperties: ['status', 'notes'],
    sort: {
      sortBy: 'createdAt',
      direction: 'desc',
    },
  },
};

// Конфигурация для заявок на работу
const applicationFormResource = {
  resource: ApplicationForm,
  options: {
    navigation: {
      name: 'Формы',
      icon: 'DocumentText',
    },
    properties: {
      _id: {
        isVisible: { list: true, filter: true, show: true, edit: false },
      },
      firstName: {
        isTitle: true,
        position: 1,
      },
      lastName: {
        position: 2,
      },
      email: {
        position: 3,
      },
      phone: {
        position: 4,
      },
      applicationPosition: {
        position: 5,
        availableValues: [
          { value: 'Implantologists Speakers', label: 'Implantologists Speakers' },
          { value: 'Italy/Abroad Agents', label: 'Italy/Abroad Agents' },
          { value: 'Dealer-Distributors Italy/Abroad', label: 'Dealer-Distributors Italy/Abroad' },
          { value: 'Other', label: 'Other' },
        ],
      },
      status: {
        position: 6,
        availableValues: [
          { value: 'new', label: '🆕 Новая' },
          { value: 'reviewed', label: '👁️ Просмотрена' },
          { value: 'shortlisted', label: '⭐ В шорт-листе' },
          { value: 'rejected', label: '❌ Отклонена' },
          { value: 'hired', label: '✅ Нанят' },
        ],
      },
      contactHours: {
        position: 7,
      },
      message: {
        type: 'textarea',
        position: 8,
      },
      'cvFile.originalName': {
        position: 9,
        isVisible: { list: true, filter: false, show: true, edit: false },
      },
      'cvFile.size': {
        position: 10,
        isVisible: { list: false, filter: false, show: true, edit: false },
      },
      'cvFile.path': {
        position: 11,
        isVisible: { list: false, filter: false, show: true, edit: false },
      },
      privacyAccepted: {
        position: 12,
        isVisible: { list: false, filter: true, show: true, edit: false },
      },
      notes: {
        type: 'textarea',
        position: 13,
      },
      createdAt: {
        isVisible: { list: true, filter: true, show: true, edit: false },
        position: 14,
      },
      updatedAt: {
        isVisible: { list: true, filter: true, show: true, edit: false },
        position: 15,
      },
    },
    listProperties: ['firstName', 'lastName', 'email', 'phone', 'applicationPosition', 'cvFile.originalName', 'status', 'createdAt'],
    filterProperties: ['firstName', 'lastName', 'email', 'status', 'applicationPosition', 'createdAt'],
    showProperties: [
      'firstName', 'lastName', 'email', 'phone', 'applicationPosition',
      'contactHours', 'message', 'cvFile.originalName', 'cvFile.size', 'cvFile.path',
      'status', 'notes', 'privacyAccepted', 'createdAt', 'updatedAt'
    ],
    editProperties: ['status', 'notes'],
    sort: {
      sortBy: 'createdAt',
      direction: 'desc',
    },
  },
};

// Главная конфигурация AdminJS
const adminOptions = {
  resources: [
    {
      ...contactFormResource,
      options: {
        ...contactFormResource.options,
        id: 'ContactForm',
        navigation: {
          name: 'Формы',
          icon: 'DocumentText',
        },
      },
    },
    {
      ...applicationFormResource,
      options: {
        ...applicationFormResource.options,
        id: 'ApplicationForm',
        navigation: {
          name: 'Формы',
          icon: 'DocumentText',
        },
      },
    },
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'Dental Forms Admin',
    logo: false,
    softwareBrothers: false,
    theme: {
      colors: {
        primary100: '#667eea',
        primary80: '#764ba2',
        primary60: '#667eea',
        primary40: '#8896f1',
        primary20: '#b4bcf7',
      },
    },
  },
  locale: {
    language: 'ru',
    translations: {
      ru: {
        resources: {
          ContactForm: {
            name: 'Контактные заявки',
            properties: {
              firstName: 'Имя',
              lastName: 'Фамилия',
              email: 'Email',
              phone: 'Телефон',
              position: 'Позиция',
              city: 'Город',
              province: 'Область',
              country: 'Страна',
              message: 'Сообщение',
              contactDays: 'Дни для связи',
              status: 'Статус',
              notes: 'Заметки',
              privacyAccepted: 'Согласие с политикой',
              newsletterConsent: 'Согласие на рассылку',
              createdAt: 'Создано',
              updatedAt: 'Обновлено',
            },
          },
          ApplicationForm: {
            name: 'Заявки на работу',
            properties: {
              firstName: 'Имя',
              lastName: 'Фамилия',
              email: 'Email',
              phone: 'Телефон',
              applicationPosition: 'Позиция',
              contactHours: 'Часы для связи',
              message: 'Сообщение',
              'cvFile.originalName': 'Имя файла CV',
              'cvFile.size': 'Размер файла',
              'cvFile.path': 'Скачать CV',
              status: 'Статус',
              notes: 'Заметки',
              privacyAccepted: 'Согласие с политикой',
              createdAt: 'Создано',
              updatedAt: 'Обновлено',
            },
          },
        },
        actions: {
          new: 'Создать',
          edit: 'Редактировать',
          show: 'Показать',
          delete: 'Удалить',
          bulkDelete: 'Удалить выбранные',
          list: 'Список',
        },
        buttons: {
          save: 'Сохранить',
          login: 'Войти',
          filter: 'Фильтр',
          resetFilter: 'Сбросить',
          confirmRemovalMany: 'Подтвердить удаление {{count}} записей',
          confirmRemovalMany_plural: 'Подтвердить удаление {{count}} записей',
        },
        labels: {
          navigation: 'Навигация',
          pages: 'Страницы',
          selectedRecords: 'Выбрано ({{selected}})',
          filters: 'Фильтры',
          adminVersion: 'Версия Admin: {{version}}',
          appVersion: 'Версия приложения: {{version}}',
          loginWelcome: 'Добро пожаловать',
        },
        messages: {
          successfullyBulkDeleted: 'Успешно удалено {{count}} записей',
          successfullyDeleted: 'Успешно удалено',
          successfullyUpdated: 'Успешно обновлено',
          thereWereValidationErrors: 'Есть ошибки валидации',
          forbiddenError: 'Недостаточно прав',
          anyForbiddenError: 'Действие запрещено',
          successfullyCreated: 'Успешно создано',
          bulkDeleteError: 'Ошибка при удалении',
          errorFetchingRecords: 'Ошибка загрузки данных',
          errorFetchingRecord: 'Ошибка загрузки записи',
          noRecordsSelected: 'Не выбрано записей',
          theseRecordsWillBeRemoved: 'Эти записи будут удалены',
          theseRecordsWillBeRemoved_plural: 'Эти записи будут удалены',
          pickSomeFirstToRemove: 'Выберите записи для удаления',
          error404Resource: 'Ресурс не найден',
          error404Action: 'Действие не найдено',
          moveUp: 'Вверх',
          moveDown: 'Вниз',
          confirmDelete: 'Подтвердить удаление',
        },
      },
    },
  },
};

// Создание и экспорт AdminJS
const createAdminRouter = async (app) => {
  const admin = new AdminJS(adminOptions);

  // Простая аутентификация (можно улучшить)
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { email: ADMIN_EMAIL };
        }
        return null;
      },
      cookieName: 'adminjs',
      cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'some-secret-password-used-to-secure-cookie',
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || 'sessionsecret',
    }
  );

  app.use(admin.options.rootPath, adminRouter);

  return admin;
};

module.exports = createAdminRouter;