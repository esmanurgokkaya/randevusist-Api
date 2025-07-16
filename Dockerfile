# Temel imaj: Node.js
FROM node:18

# Uygulama klasörünü ayarla
WORKDIR /app

# package.json ve package-lock.json kopyala
COPY package*.json ./

# Paketleri yükle
RUN npm install

# Diğer tüm dosyaları kopyala
COPY . .

# 3000 portunu aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
