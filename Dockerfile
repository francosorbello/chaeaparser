FROM node:11-slim

#carpeta donde guardo el codigo
WORKDIR /www/chaeaparser

#instalo nodemon
RUN npm install nodemon -g
#añado el package.json e instalo las dependencias
COPY package*.json ./
RUN npm install

#copio el resto del codigo
COPY . .

#añado script con el que espero a que mysql esté activo
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait

#puerto que usa la aplicacion
EXPOSE 3002

# CMD [ "node", "server.js" ]
CMD /wait && node server.js