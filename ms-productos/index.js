require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// --- Configuración de Firebase ---
// En LOCAL usa serviceAccount.json. En Railway (producción) se reemplaza
// por variables de entorno (ver guía "ShopNow en Railway", Fase 3).
const serviceAccount = require('./serviceAccount.json');
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Nota: este microservicio NO verifica el token JWT directamente.
// Esa responsabilidad es del Gateway, que solo reenvía la petición
// aquí si el token es válido. ms-productos confía en el Gateway.

// --- GET /productos ---
app.get('/productos', async (req, res) => {
  try {
    const snapshot = await db.collection('productos').get();
    const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// --- POST /productos ---
app.post('/productos', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({ error: 'nombre, precio y stock son requeridos' });
    }

    const nuevoProducto = { nombre, precio, stock };
    const docRef = await db.collection('productos').add(nuevoProducto);

    res.status(201).json({ id: docRef.id, ...nuevoProducto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// --- GET /productos/:id ---
app.get('/productos/:id', async (req, res) => {
  try {
    const doc = await db.collection('productos').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// --- PUT /productos/:id ---
app.put('/productos/:id', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const docRef = db.collection('productos').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    await docRef.update({ nombre, precio, stock });
    res.status(200).json({ id: req.params.id, nombre, precio, stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// --- DELETE /productos/:id ---
app.delete('/productos/:id', async (req, res) => {
  try {
    const docRef = db.collection('productos').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    await docRef.delete();
    res.status(200).json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// --- Health check ---
app.get('/', (req, res) => {
  res.json({ servicio: 'ms-productos', estado: 'ok' });
});

app.listen(PORT, () => {
  console.log(`ms-productos corriendo en el puerto ${PORT}`);
});
