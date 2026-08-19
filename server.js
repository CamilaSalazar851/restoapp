require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const seedAdmin = require('./scripts/seedAdmin');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restoapp';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('DB conectada');
    // Solo seed en entorno de desarrollo o si se indica
    if (process.env.SEED_ADMIN !== 'false') {
      try { await seedAdmin(); } catch (e) { console.error('Seed failed', e); }
    }
  })
  .catch(err => console.error('Error DB', err));

// Rutas API
app.use('/api/auth', authRoutes);

// Servir frontend estático del repo (las páginas HTML en la raíz)
app.use(express.static(path.join(__dirname)));

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ok on port ${PORT}`));
