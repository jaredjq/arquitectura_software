const express = require('express');
const router = express.Router();
const authController = require('../back/authController');
const path = require('path');


// Ruta para enviar correo de recuperación
router.post('/forgot-password', (req, res) => {
  console.log('Solicitud recibida en /auth/forgot-password');
  authController.sendResetPasswordEmail(req, res);  // Llama al controlador
});

// Ruta para mostrar el formulario de nueva contraseña (GET desde correo)
router.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/reset-password.html'));
});

// Ruta para restablecer la contraseña
router.post('/reset-password', authController.resetPassword);

// Ruta para la conexion del login
router.post('/login', (req, res) => {
    console.log('Solicitud recibida en /login con body:', req.body);
    authController.login(req, res);
});

// Ruta para crear usuarios

router.post('/crearUsuario', (req, res) =>{
  console.log('Solicitud recibida en /auth/crearUsuario');
  authController.creacionUsuario(req, res); // Llama al controlador
})

// Ruta para generar la tabla de usuarios
router.get("/obtenerUsuarios",  authController.listarUsuarios); // para tabla

router.get("/obtenerUsuariosCondicion",  authController.listarUsuariosCondicion); // para tabla

// Ruta para actualizar el rol
router.put("/usuarios/:id/cambiar-rol", authController.actualizarRol); // para update


// Ruta para actualizar la condicion
router.put("/usuarios/:id/cambiar-condicion", authController.actualizarCondicion); // para update
router.put("/usuarios/:id/modificar-datos", authController.modificarDatosUsuario);

router.get('/ot/:id_trabajo/procesos-merma', authController.obtenerProcesosMerma);

router.post('/verificaOT', (req, res) => {
  console.log('Solicitud recibida en /auth/verificaOT');
  authController.verificarOrdenTrabajo(req, res);  // Llama al controlador
});

router.post('/crearOT', (req, res) => {
  console.log('Solicitud recibida en /auth/crearOT');
  authController.crearOrdenTrabajo(req, res);  // Llama al controlador
});


router.get('/datosOT', (req, res) => {
  console.log('Solicitud recibida en /auth/datosOT');
  authController.traerdatosTrabajo(req, res);  // Llama al controlador
});

//intento de crear un guardar datos en proceso-----
router.get('/guardar-datos', (req, res) => {
  console.log('Solicitud recibida en /guardar-datos');
  authController.guardardatosProduccion(req, res);  // Llama al controlador ---falta no estamos seguros
});

//ruta de generacion del pdf
router.get('/generar-pdf/:nombre_trabajo', authController.generarReportePDF);

//ruta de conexion de generar grafica
router.post('/generar-grafica', (req, res) => {
  console.log('Solicitud recibida en /auth/generar-grafica');
  authController.generarGraficas(req, res);  // Llama al controlador
});

//ruta de conexion de generar grafica
router.post('/generar-grafica2', (req, res) => {
  console.log('Solicitud recibida en /auth/generar-grafica2');
  authController.generarGraficas2(req, res);  // Llama al controlador
});

router.get('/listar-proyectos', (req, res) => {
  authController.listarProyectos(req, res);
});

// Ruta para actualizar la cualquier dato de la OT
router.put("/actualizarProcesos", (req, res) => {
  authController.actualizarOT(req, res);
});

// 🔍 Verificar OT para calculadora de merma
router.post('/verificarOTMerma', authController.verificarOTMerma);

// 🔎 Obtener datos de merma por OT
router.post('/obtenerMerma', authController.obtenerMermaOT);

router.post('/crearSolicitud', (req, res) => {
  console.log('Solicitud recibida en /auth/crearSolicitud');
  authController.crearSolicitud(req, res);  // Llama al controlador
});

router.get("/obtenerSolicitudes",  authController.listarSolicitudes); // para tabla

// Ruta para actualizar el estado
router.put("/solicitudes/:id/cambiar-estado", authController.actualizarEstado); // para update

module.exports = router;