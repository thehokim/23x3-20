const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor() {
    this.bot = null;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    }
  }

  async sendContactFormNotification(formData) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram bot not configured');
      return;
    }

    const message = `
🔔 *Новая контактная заявка*

👤 *Имя:* ${formData.firstName} ${formData.lastName}
📧 *Email:* ${formData.email}
📱 *Телефон:* ${formData.phone}
💼 *Позиция:* ${formData.position}
🌍 *Локация:* ${formData.city}${formData.province ? ', ' + formData.province : ''}${formData.country ? ', ' + formData.country : ''}

${formData.message ? '💬 *Сообщение:*\n' + formData.message : ''}

${formData.contactDays ? '📅 *Время связи:* ' + formData.contactDays : ''}

🆔 *ID заявки:* \`${formData._id}\`
⏰ *Время:* ${new Date(formData.createdAt).toLocaleString('ru-RU')}
    `;

    try {
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
      console.log('Telegram notification sent successfully');
    } catch (error) {
      console.error('Error sending Telegram notification:', error.message);
    }
  }

  async sendApplicationFormNotification(formData) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram bot not configured');
      return;
    }

    const message = `
📝 *Новая заявка на работу*

👤 *Имя:* ${formData.firstName} ${formData.lastName}
📧 *Email:* ${formData.email}
📱 *Телефон:* ${formData.phone}
💼 *Позиция:* ${formData.applicationPosition}

${formData.contactHours ? '🕐 *Часы связи:* ' + formData.contactHours : ''}

${formData.message ? '💬 *Сообщение:*\n' + formData.message : ''}

${formData.cvFile ? '📎 *CV загружен:* ' + formData.cvFile.originalName : '❌ *CV не загружен*'}

🆔 *ID заявки:* \`${formData._id}\`
⏰ *Время:* ${new Date(formData.createdAt).toLocaleString('ru-RU')}
    `;

    try {
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
      console.log('Telegram notification sent successfully');
    } catch (error) {
      console.error('Error sending Telegram notification:', error.message);
    }
  }

  async sendStatusUpdate(formType, formId, oldStatus, newStatus, formData) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram bot not configured');
      return;
    }

    const formTypeText = formType === 'contact' ? 'Контактная заявка' : 'Заявка на работу';
    const message = `
🔄 *Обновление статуса*

📋 *Тип:* ${formTypeText}
🆔 *ID:* \`${formId}\`
👤 *Клиент:* ${formData.firstName} ${formData.lastName}

📊 *Статус изменен:*
   Было: ${oldStatus}
   Стало: *${newStatus}*

⏰ *Время:* ${new Date().toLocaleString('ru-RU')}
    `;

    try {
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error sending status update:', error.message);
    }
  }
}

module.exports = new TelegramService();
