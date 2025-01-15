const corsOptions = {
  origin: 'http://localhost:5173', // L'URL de votre application Vue.js
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
