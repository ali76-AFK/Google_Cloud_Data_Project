FROM node:18-bullseye

WORKDIR /app

COPY frontend/package.json /app/frontend/package.json
COPY frontend/package-lock.json /app/frontend/package-lock.json

WORKDIR /app/frontend
RUN npm ci

COPY frontend /app/frontend

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
