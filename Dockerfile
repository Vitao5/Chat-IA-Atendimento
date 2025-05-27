# Dockerfile

# Usa uma imagem base oficial do Node.js com as ferramentas necessárias
FROM node:18-slim

# Instala o Chromium e suas dependências
# A versão do Chromium deve ser compatível com a versão do Puppeteer no seu whatsapp-web.js
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpangocairo-1.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxtst6 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    libxkbcommon0 \
    libxrender1 \
    libffi-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libwebp-dev \
    libgconf-2-4 \
    libxss1 \
    # Limpeza
    && rm -rf /var/lib/apt/lists/*

# Cria e define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia package.json e package-lock.json e instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código da sua aplicação
COPY . .

# Comando para iniciar a aplicação
CMD ["npm", "start"]