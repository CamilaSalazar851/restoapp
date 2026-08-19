const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Registro de admin (usa solo si quieres crear admin vía API; protégelo)
router.post('/register-admin', async (req, res) => {
  try {
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

// Login simple (devuelve info mínima)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan datos' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    // Aquí puedes generar un JWT y devolverlo
    res.json({ message: 'Login ok', user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
