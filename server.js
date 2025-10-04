require('dotenv').config();

const path = require('path');
const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./back/authRoutes');
const authController = require('./back/authController');
const cors = require('cors'); // ar CORS
const db = require('./back/db');
const { guardarDatos, generarPDF } = require('./back/databaseAndPDF');// Importamos las funciones de base de datos y PDF

const app = express();

console.log("Entro al server:");
console.log("🔧 DB_HOST que leyó el código:", process.env.DB_HOST);

process.on('uncaughtException', function (err) {
  console.error('❌ Excepción no capturada:', err);
});

process.on('unhandledRejection', function (reason, promise) {
  console.error('❌ Rechazo no manejado:', reason);
});

db.query('SELECT @@hostname;', (err, results) => {
  if (err) {
    console.error('No se pudo obtener el hostname:', err);
  } else {
    console.log('🖥 Hostname MySQL del código:', results[0]['@@hostname']);
  }
});

// 🔐 Middleware de sesión (debe ir antes de cualquier ruta)
app.use(session({
  secret: 'clave',
  resave: false,
  saveUninitialized: false
}));

// Habilitar CORS para permitir solicitudes desde otros orígenes
/*app.use(cors({
  origin: 'https://hilmart.site', // Permite solo a este dominio acceder
  methods: ['GET', 'POST'],
  credentials: true // Permite enviar cookies (si las tienes)
}));*/

// Middleware para leer datos del formulario
app.use(bodyParser.urlencoded({ extended: false }));

// Configurar body-parser para manejar JSON
app.use(bodyParser.json());

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'Frontend')));

// Rutas de autenticación
app.use('/auth', authRoutes);

// Otras rutas que puedan existir en tu aplicación (por ejemplo, rutas generales o estáticas)
app.get('/index.html', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// Ruta principal (muestra el formulario de ingreso de datos)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "IngresoDatos.html"));
});


// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


app.use((err, req, res, next) => {
  console.error('Error en la ruta:', err);
  console.error('Stacktrace:', err.stack);
  res.status(500).send('Error interno del servidor');
});
