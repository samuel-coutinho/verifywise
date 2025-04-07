FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Copy templates if needed
COPY ./templates ./dist/templates

# Make sure the start.sh is executable
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]
