require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'shopnow_secret_2025';

// En LOCAL estas apuntan a localhost. En Railway se configuran como
// variables de entorno con las URLs públicas reales de cada servicio
// (ver guía "ShopNow en Railway", Fase 4).
const USUARIOS_URL = process.env.USUARIOS_URL || 'http://localhost:3001';
const PRODUCTOS_URL = process.env.PRODUCTOS_URL || 'http://localhost:3002';

// --- Middleware de autenticación ---
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// --- Rutas de usuarios (públicas: registro y login) ---
app.post('/api/users/register', async (req, res) => {
  try {
    const respuesta = await axios.post(`${USUARIOS_URL}/register`, req.body);
    res.status(respuesta.status).json(respuesta.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Error al conectar con ms-usuarios' };
    res.status(status).json(data);
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const respuesta = await axios.post(`${USUARIOS_URL}/login`, req.body);
    res.status(respuesta.status).json(respuesta.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Error al conectar con ms-usuarios' };
    res.status(status).json(data);
  }
});

// --- Rutas de productos (protegidas con JWT) ---
app.get('/api/products', verificarToken, async (req, res) => {
  try {
    const respuesta = await axios.get(`${PRODUCTOS_URL}/productos`);
    res.status(respuesta.status).json(respuesta.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Error al conectar con ms-productos' };
    res.status(status).json(data);
  }
});

app.post('/api/products', verificarToken, async (req, res) => {
  try {
    const respuesta = await axios.post(`${PRODUCTOS_URL}/productos`, req.body);
    res.status(respuesta.status).json(respuesta.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Error al conectar con ms-productos' };
    res.status(status).json(data);
  }
});

app.get('/api/products/:id', verificarToken, async (req, res) => {
  try {
    const respuesta = await axios.get(`${PRODUCTOS_URL}/productos/${req.params.id}`);
    res.status(respuesta.status).json(respuesta.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Error al conectar con ms-productos' };
    res.status(status).json(data);
  }
});

app.put('/api/products/:id', verificarToken, async (req, res) => {
  try {
    const respuesta = await axios.put(`${PRODUCTOS_URL}/productos/${req.params.id}`, req.body);
    res.status(respuesta.status).json(respuesta.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Error al conectar con ms-productos' };
    res.status(status).json(data);
  }
});

app.delete('/api/products/:id', verificarToken, async (req, res) => {
  try {
    const respuesta = await axios.delete(`${PRODUCTOS_URL}/productos/${req.params.id}`);
    res.status(respuesta.status).json(respuesta.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Error al conectar con ms-productos' };
    res.status(status).json(data);
  }
});

// --- Health check ---
app.get('/', (req, res) => {
  res.json({ servicio: 'gateway', estado: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Gateway corriendo en el puerto ${PORT}`);
});
