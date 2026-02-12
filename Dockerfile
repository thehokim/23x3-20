# Multi-stage build для оптимизации размера образа

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Production
FROM node:18-alpine

# Метаданные
LABEL maintainer="your-email@example.com"
LABEL description="Dental Forms API with AdminJS"
LABEL version="1.0.0"

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Копируем зависимости из первого stage
COPY --from=dependencies /app/node_modules ./node_modules

# Копируем исходный код
COPY --chown=nodejs:nodejs . .

# Создаем необходимые директории
RUN mkdir -p uploads/cv && \
    chown -R nodejs:nodejs uploads

# Переключаемся на непривилегированного пользователя
USER nodejs

# Expose порт
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск приложения
CMD ["node", "server.js"]