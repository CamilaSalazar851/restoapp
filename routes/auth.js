const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const ADMIN_CREATE_KEY = process.env.ADMIN_CREATE_KEY || null;

function signToken(user) {
  const payload = { id: user._id, role: user.role, email: user.email, name: user.name };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Registro de admin (protegido por ADMIN_CREATE_KEY header 'x-admin-key')
router.post('/register-admin', async (req, res) => {
  try {
    if (!ADMIN_CREATE_KEY || req.headers['x-admin-key'] !== ADMIN_CREATE_KEY) {
      return res.status(403).json({ message: 'Ruta de creación de admin protegida' });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Faltan datos' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Usuario ya existe' });

    const user = new User({ name, email, password, role: 'admin' });
    await user.save();
    res.status(201).json({ message: 'Admin creado', id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Registro de usuario normal
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Faltan datos' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Usuario ya existe' });

    const user = new User({ name, email, password, role: 'user' });
    await user.save();
    res.status(201).json({ message: 'Usuario creado', id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Login - devuelve JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan datos' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = signToken(user);
    res.json({ message: 'Login ok', token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Middleware para verificar JWT
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No autorizado' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Formato de token inválido' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Obtener datos del usuario logeado
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
