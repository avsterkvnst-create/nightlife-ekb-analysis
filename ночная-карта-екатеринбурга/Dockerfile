FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY index.html server.js ./

EXPOSE 10000
CMD ["node", "server.js"]
