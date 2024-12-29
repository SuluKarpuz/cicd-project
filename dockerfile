#Stage 1 
FROM node:20.9.0-bullseye-slim as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY app.js server.js version.js ./


#Stage 2
FROM node:20.9.0-bullseye-slim 

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["node", "server.js"]
