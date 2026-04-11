FROM node:20-alpine
WORKDIR /app

# Prisma engines on Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Required at build time: @prisma/client is only a stub until this runs
RUN npx prisma generate

EXPOSE 5000
# Apply migrations then boot (idempotent; safe on every container start)
CMD ["npm", "run", "start:prod"]
