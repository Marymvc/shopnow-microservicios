require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// --- Configuración de Firebase ---
// En LOCAL usa serviceAccount.json. En Railway (producción) se reemplaza
// por variables de entorno (ver guía "ShopNow en Railway", Fase 2, Paso 4).
const serviceAccount = require('./serviceAccount.json');
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'shopnow_secret_2025';

// --- POST /register ---
app.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son requeridos' });
    }

    const usuariosRef = db.collection('usuarios');
    const existe = await usuariosRef.where('email', '==', email).get();
    if (!existe.empty) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nuevoUsuario = { nombre, email, password: passwordHash };
    const docRef = await usuariosRef.add(nuevoUsuario);

    const token = jwt.sign({ id: docRef.id, email, nombre }, JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ id: docRef.id, nombre, email, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// --- POST /login ---
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son requeridos' });
    }

    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const passwordValida = await bcrypt.compare(password, userData.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: userDoc.id, email: userData.email, nombre: userData.nombre },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ id: userDoc.id, nombre: userData.nombre, email: userData.email, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// --- Health check (útil para verificar que el servicio despliegue en Railway) ---
app.get('/', (req, res) => {
  res.json({ servicio: 'ms-usuarios', estado: 'ok' });
});

app.listen(PORT, () => {
  console.log(`ms-usuarios corriendo en el puerto ${PORT}`);
});
