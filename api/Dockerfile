FROM node
WORKDIR /api/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm rebuild bcrypt --build-from-source
RUN npm run build
CMD [ "node", "index.js" ]