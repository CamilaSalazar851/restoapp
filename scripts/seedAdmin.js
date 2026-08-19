require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;
const DEFAULT_EMAIL = process.env.DEFAULT_ADMIN_EMAIL;
const DEFAULT_PASS = process.env.DEFAULT_ADMIN_PASSWORD;
const DEFAULT_NAME = process.env.DEFAULT_ADMIN_NAME || 'Admin';

async function run() {
  if (!MONGO_URI) {
    console.error('Define MONGO_URI en .env');
    process.exit(1);
  }
  if (!DEFAULT_EMAIL || !DEFAULT_PASS) {
    console.warn('No hay credenciales por defecto: DEFAULT_ADMIN_EMAIL o DEFAULT_ADMIN_PASSWORD faltan. Abortando seed.');
    return;
  }

  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const existing = await User.findOne({ email: DEFAULT_EMAIL.toLowerCase() });
    if (existing) {
      console.log('Admin por defecto ya existe:', DEFAULT_EMAIL);
    } else {
      const admin = new User({ name: DEFAULT_NAME, email: DEFAULT_EMAIL, password: DEFAULT_PASS, role: 'admin' });
      await admin.save();
      console.log('Admin por defecto creado:', DEFAULT_EMAIL);
    }
  } catch (err) {
    console.error('Error creando admin por defecto', err);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) run();

module.exports = run;
